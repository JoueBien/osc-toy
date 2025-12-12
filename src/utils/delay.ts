/**
 * Delay for a number of ms.
 * Provide an aport controller to resolve the delay if it no longer needs to be waited for.
 * @example
 * const cancelOnController = new AbortController();
 * delay({ ms: 500, cancelOnController });
 * cancelOnController.abort();
 */
export function delay(params: {
  ms: number;
  cancelOnController?: AbortController;
}) {
  const { ms, cancelOnController } = params;
  // Wait for time to end
  return new Promise<void>((resolve) => {
    const timeOutRef = setTimeout(() => {
      resolve();
    }, ms);

    // Cancel the delay if aborted.
    cancelOnController?.signal?.addEventListener("abort", () => {
      clearTimeout(timeOutRef);
      resolve();
    });
  });
}
