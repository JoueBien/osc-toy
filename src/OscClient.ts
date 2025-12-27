import { type RemoteInfo } from "dgram";
import { type Arg, DecodedOscMessage, OscMessage } from "./OscMessage";
import { UdpClient } from "./udpClient";
import { delay } from "./utils/delay";
import { EventEmitterController } from "./utils/EventEmitterController";
import { Failure, type Result } from "fail-up";

const EMIT_MESSAGE = "message";
const EMIT_ERROR = "error";

export class OscClient {
  client: UdpClient;

  eventEmitter = new EventEmitterController();

  cleanUpController: AbortController = new AbortController();

  constructor(client: UdpClient) {
    this.client = client;
  }

  /** Connect and add a single listener so we only decode once. */
  async connect(): Promise<Result<AbortController, "connection-failed">> {
    const connected = await this.client.connect();
    if (connected instanceof Failure) {
      return connected;
    }
    this.cleanUpController = connected;

    /** Set listeners. */
    this.client.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
      const decoded = OscMessage.decode(Uint8Array.from(msg));
      this.eventEmitter.emit(EMIT_MESSAGE, decoded);
    });

    this.client.onError((err: Failure<"on-error">) => {
      this.eventEmitter.emit(EMIT_ERROR, err);
    });

    /** Return a clean up controller. */
    return this.cleanUpController;
  }

  /** Check if the underlying client is connected. */
  async isConnectionOk(): Promise<Result<"ok", "aborted" | "not-connected">> {
    return this.client.isConnectionOk();
  }

  /** Send a message. */
  async send(params: { address: string; argsArray?: Arg[] }) {
    const message = OscMessage.encode(params.address, params.argsArray);
    return this.client.send(message);
  }

  /** Add a listener to listen for all messages. */
  onAnyMessage<RT = Arg[]>(callBack: (message: DecodedOscMessage<RT>) => void) {
    return this.eventEmitter.listen(EMIT_MESSAGE, callBack);
  }

  /** Add a listener to listen for any message once. */
  onOnceAnyMessage<RT = Arg[]>(
    callBack: (message: DecodedOscMessage<RT>) => void
  ) {
    return this.eventEmitter.listenOnce(EMIT_MESSAGE, callBack);
  }

  /** Add a listener to listen for all errors. */
  onError(callBack: (err: Failure<"on-error">) => void) {
    return this.eventEmitter.listen(EMIT_ERROR, callBack);
  }

  /** Add a listener to listen for any error once. */
  onOnceError(callBack: (err: Failure<"on-error">) => void) {
    return this.eventEmitter.listenOnce(EMIT_ERROR, callBack);
  }

  /** Add a listener to listen for a messages with an address. */
  onMessage<RT = Arg[]>(params: {
    address: string;
    callBack: (message: DecodedOscMessage<RT>) => void;
  }) {
    return this.eventEmitter.listen(
      EMIT_MESSAGE,
      (message: DecodedOscMessage<RT>) => {
        if (message.address === params.address) {
          params.callBack(message);
        }
      }
    );
  }

  /** Add a listener to listen for a message with an address once. */
  onOnceMessage<RT = Arg[]>(params: {
    address: string;
    callBack: (message: DecodedOscMessage<RT>) => void;
  }) {
    return this.eventEmitter.listenOnce(
      EMIT_MESSAGE,
      (message: DecodedOscMessage<RT>) => {
        if (message.address === params.address) {
          params.callBack(message);
        }
      }
    );
  }

  /** Wait for a message with an address. */
  async waitForMessage<RT = Arg[]>(params: {
    address: string;
    exitMs?: number;
  }): Promise<DecodedOscMessage<RT> | Error> {
    const resolver = new Promise<DecodedOscMessage<RT> | Error>((resolve) => {
      const delayController = new AbortController();

      const listenerCleanUp = this.onOnceMessage({
        address: params.address,
        callBack: (message: DecodedOscMessage<RT>) => {
          if (message.address === params.address) {
            delayController.abort();
            resolve(message);
          }
        },
      });

      delay({
        ms: params.exitMs || 1000,
        cancelOnController: delayController,
      }).then(() => {
        listenerCleanUp();
        resolve(new Error(`Too slow to reply on ${params.address}`));
      });
    });

    return resolver;
  }

  /** Send and wait for a message. */
  async sendAndWaitForMessage<RT = Arg[]>(params: {
    send: {
      address: string;
      args: Arg[];
    };
    listen: {
      address: string;
      exitMs?: number;
    };
  }) {
    const floatingPromise = this.waitForMessage<RT>({
      address: params.listen.address,
      exitMs: params.listen.exitMs,
    });
    await this.send(params.send);
    return floatingPromise;
  }
}
