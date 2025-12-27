import dgram from "dgram";
import { type Result, Failure } from "fail-up";

type ListenerCleanUpFunc = () => void;

export class UdpClient {
  private remoteAddress: string;
  private remotePort: number;
  private responsePort: number;

  private client: dgram.Socket;
  private connectRan: boolean = false;

  cleanUpController = new AbortController();

  constructor(params: {
    remotePort: number;
    remoteAddress?: string;
    responsePort: number;
  }) {
    // Set Local State
    this.remoteAddress = params.remoteAddress || "localhost";
    this.remotePort = params.remotePort;
    this.remotePort = params.remotePort;
    this.responsePort = params.responsePort;
    // Set Client
    const client = dgram.createSocket({
      type: "udp4",
      signal: this.cleanUpController.signal,
    });

    this.client = client;
  }

  /** Check if the client is connected. */
  async isConnectionOk(): Promise<Result<"ok", "aborted" | "not-connected">> {
    if (this.cleanUpController.signal.aborted) {
      return new Failure({
        type: "aborted",
        message: "Unable to communicate as socket was aborted.",
      });
    }

    if (this.connectRan === false) {
      return new Failure({
        type: "not-connected",
        message: "Unable to communicate as socket was never connected.",
      });
    }

    return "ok";
  }

  /** Connect to port on address as async */
  async connect(): Promise<Result<AbortController, "connection-failed">> {
    const floatingPromise = new Promise<
      Result<AbortController, "connection-failed">
    >((resolve, rejects) => {
      this.connectRan = false;
      // Deal with error
      function onConnectError(err: Error) {
        this.connectRan = false;
        console.error(err);
        console.trace(err);

        rejects(
          new Failure({
            type: "connection-failed",
            message: err.message,
          })
        );
      }
      try {
        this.client.bind(this.responsePort);
        this.client.once("error", onConnectError);
        this.client.connect(this.remotePort, this.remoteAddress, () => {
          this.client.off("error", onConnectError);
          this.connectRan = true;
          resolve(this.cleanUpController);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          onConnectError(e);
        }
        onConnectError(new Error("Unknown connection error"));
      }
    });

    return floatingPromise;
  }

  /** Send an encoded message. */
  async send(
    msg: string | NodeJS.ArrayBufferView
  ): Promise<Result<"ok", "send-failure" | "aborted" | "not-connected">> {
    const connectedOrError = await this.isConnectionOk();
    if (connectedOrError !== "ok") {
      return Promise.resolve(connectedOrError);
    }

    const floatingPromise = new Promise<Result<"ok", "send-failure">>(
      (resolve) => {
        this.client.send(msg, (err: Failure<"send-failure">) => {
          if (err !== null) {
            err.type = "send-failure";
            return resolve(err);
          }
          return resolve("ok");
        });
      }
    );
    return floatingPromise;
  }

  /** Adds a message listener & returns a function that can be used to clean up the listener. */
  onMessage(
    callBack: (msg: Buffer, rinfo: dgram.RemoteInfo) => void
  ): ListenerCleanUpFunc {
    this.client.on("message", callBack);
    const cleanUp = () => {
      this.client.off("message", callBack);
    };
    return cleanUp;
  }

  /** Adds a once message listener & returns a function that can be used to clean up the listener. */
  onOnceMessage(
    callBack: (msg: Buffer, rinfo: dgram.RemoteInfo) => void
  ): ListenerCleanUpFunc {
    this.client.once("message", callBack);
    const cleanUp = () => {
      this.client.off("message", callBack);
    };
    return cleanUp;
  }

  /** Adds a error listener & returns a function that can be used to clean up the error. */
  onError(callBack: (err: Failure<"on-error">) => void): ListenerCleanUpFunc {
    function errorWrapper(error: Failure<"on-error">) {
      error.type = "on-error";
      callBack(error);
    }

    this.client.on("error", errorWrapper);
    const cleanUp = () => {
      this.client.off("error", errorWrapper);
    };
    return cleanUp;
  }

  /** Adds a once error listener & returns a function that can be used to clean up the error. */
  onOnceError(
    callBack: (err: Failure<"on-error">) => void
  ): ListenerCleanUpFunc {
    function errorWrapper(error: Failure<"on-error">) {
      error.type = "on-error";
      callBack(error);
    }

    this.client.once("error", errorWrapper);
    const cleanUp = () => {
      this.client.off("error", errorWrapper);
    };
    return cleanUp;
  }
}
