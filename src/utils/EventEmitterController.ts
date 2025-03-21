import EventEmitter from "events";

export class EventEmitterController {
  eventEmitter = new EventEmitter();

  listen(eventName: string, listener: (...args: any[]) => void) {
    this.eventEmitter.on(eventName, listener);
    const cleanUp = () => {
      this.eventEmitter.off(eventName, listener);
    };
    return cleanUp;
  }

  listenOnce(eventName: string, listener: (...args: any[]) => void) {
    this.eventEmitter.once(eventName, listener);
    const cleanUp = () => {
      this.eventEmitter.off(eventName, listener);
    };
    return cleanUp;
  }

  emit(eventName: string, args: any) {
    this.eventEmitter.emit(eventName, args);
  }

  removeAllListeners() {
    this.eventEmitter.removeAllListeners();
  }
}
