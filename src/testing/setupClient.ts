import { beforeEach, afterEach, vi } from "vitest";
import { OscTransport, OscTransportParams } from "../OscTransport";

export function setupClient(params?: Partial<OscTransportParams>) {
  let client: OscTransport;

  const clientOnSpy = vi.fn();

  beforeEach(() => {
    client = new OscTransport({
      remotePort: 9000,
      responsePort: 9001,
      ...params,
    });

    client.onAnyMessage((event) => {
      clientOnSpy(event);
    });
  });

  // Make sure we clean up.
  afterEach(() => {
    client.cleanUpController.abort();
  });

  function getCurrentClient() {
    return client;
  }

  return {
    /** Get the current client that has been set up. */
    getCurrentClient,
    clientOnSpy,
  };
}
