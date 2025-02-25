import dgram from "dgram";

type ListenerCleanUpFunc = () => void;

export class UdpClient {
  private remoteAddress: string;
  private remotePort: number;
  private responsePort: number;

  private client: dgram.Socket;

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
    client.bind(this.responsePort);
    this.client = client;
  }

  /** Connect to port on address as async */
  async connect(): Promise<AbortController | Error> {
    const floatingPromise = new Promise<AbortController | Error>(
      (resolve, rejects) => {
        // Deal with error
        function onConnectError(err: Error) {
          rejects(err);
        }
        this.client.once("error", onConnectError);
        this.client.connect(this.remotePort, this.remoteAddress, () => {
          this.client.off("error", onConnectError);
          resolve(this.cleanUpController);
        });
      }
    );

    return floatingPromise;
  }

  async send(msg: string | NodeJS.ArrayBufferView): Promise<boolean | Error> {
    const floatingPromise = new Promise<boolean | Error>((resolve, rejects) => {
      this.client.send(msg, (err) => {
        console.log(msg);
        if (err !== null) {
          return rejects(err);
        }
        return resolve(true);
      });
    });
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
  onError(callBack: (err: Error) => void): ListenerCleanUpFunc {
    this.client.on("error", callBack);
    const cleanUp = () => {
      this.client.off("error", callBack);
    };
    return cleanUp;
  }

  onOnceError(callBack: (err: Error) => void): ListenerCleanUpFunc {
    this.client.once("error", callBack);
    const cleanUp = () => {
      this.client.off("error", callBack);
    };
    return cleanUp;
  }
}
