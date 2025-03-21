import { type RemoteInfo } from "dgram";
import { type Arg, DecodedOscMessage, OscMessage } from "./OscMessage";
import { UdpClient } from "./udpClient";
import { delay } from "./utils/delay";
import { EventEmitterController } from "./utils/EventEmitterController";

const EMIT_MESSAGE = "message";
const EMIT_ERROR = "error";

export class OscClient {
  client: UdpClient;

  eventEmitter = new EventEmitterController();

  cleanUpController: AbortController = new AbortController();

  constructor(client: UdpClient) {
    this.client = client;
  }

  // Connect and add a single listener so we only decode once.
  async connect() {
    /** TODO: deal with client failure & registering clean up. */
    const connected = await this.client.connect();
    if (connected instanceof Error) {
      return connected;
    }
    this.cleanUpController = connected;

    this.client.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
      const decoded = OscMessage.decode(msg);
      this.eventEmitter.emit(EMIT_MESSAGE, decoded);
    });

    this.client.onError((err: Error) => {
      this.eventEmitter.emit(EMIT_ERROR, err);
    });
    return this.cleanUpController;
  }

  async send(params: { address: string; argsArray?: Arg[] }) {
    const message = OscMessage.encode(params.address, params.argsArray);
    return this.client.send(message);
  }

  onAnyMessage(callBack: (message: DecodedOscMessage) => void) {
    return this.eventEmitter.listen(EMIT_MESSAGE, callBack);
  }

  onOnceAnyMessage(callBack: (message: DecodedOscMessage) => void) {
    return this.eventEmitter.listenOnce(EMIT_MESSAGE, callBack);
  }

  onError(callBack: (err: Error) => void) {
    return this.eventEmitter.listen(EMIT_ERROR, callBack);
  }

  onOnceError(callBack: (err: Error) => void) {
    return this.eventEmitter.listenOnce(EMIT_ERROR, callBack);
  }

  onMessage(params: {
    address: string;
    callBack: (message: DecodedOscMessage) => void;
  }) {
    return this.eventEmitter.listen(
      EMIT_MESSAGE,
      (message: DecodedOscMessage) => {
        if (message.address === params.address) {
          params.callBack(message);
        }
      }
    );
  }

  onOnceMessage(params: {
    address: string;
    callBack: (message: DecodedOscMessage) => void;
  }) {
    return this.eventEmitter.listenOnce(
      EMIT_MESSAGE,
      (message: DecodedOscMessage) => {
        if (message.address === params.address) {
          params.callBack(message);
        }
      }
    );
  }

  async waitForMessage(params: {
    address: string;
    exitMs?: number;
  }): Promise<DecodedOscMessage | Error> {
    let isResolved = false;
    const resolver = new Promise<DecodedOscMessage | Error>((resolve) => {
      const listenerCleanUp = this.onOnceMessage({
        address: params.address,
        callBack: (message: DecodedOscMessage) => {
          if (message.address === params.address) {
            isResolved = true;
            resolve(message);
          }
        },
      });
      delay(params.exitMs || 1000).then(() => {
        if (isResolved === false) {
          listenerCleanUp();
          resolve(new Error(`Too slow to reply on ${params.address}`));
        }
      });
    });

    return resolver;
  }

  async sendAndWaitForMessage(params: {
    send: {
      address: string;
      args: Arg[];
    };
    listen: {
      address: string;
      exitMs?: number;
    };
  }) {
    const floatingPromise = this.waitForMessage({
      address: params.listen.address,
      exitMs: params.listen.exitMs,
    });
    await this.send(params.send);
    return floatingPromise;
  }
}
