import { OscTransport, OscTransportParams } from "../OscTransport";
import { beforeEach, afterEach, vi } from "vitest";

export function setupServer(params?: Partial<OscTransportParams>) {
  let server: OscTransport;

  const serverOnSpy = vi.fn();

  beforeEach(() => {
    server = new OscTransport({
      responsePort: 9000,
      ...params,
    });

    server.onAnyMessage((event) => {
      serverOnSpy(event);
    });
  });

  // Make sure we clean up.
  afterEach(() => {
    server.cleanUpController.abort();
  });

  function getCurrentServer() {
    return server;
  }

  return {
    /** Get the current server that has been set up. */
    getCurrentServer,
    serverOnSpy,
  };
}
