/**
 * Waits for the specified element to be removed from the DOM.
 *
 * @param {HTMLElement} element - The element to wait for deletion.
 * @param {HTMLElement} staticElement - The static element to observe for changes.
 * @return {Promise<void>} A promise that resolves when the element is deleted.
 */
export function waitForElementDeletion(
  element: HTMLElement,
  staticElement: HTMLElement,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.removedNodes.forEach((node) => {
            if (node === element) {
              observer.disconnect();
              resolve();
            }
          });
        }
      }
    });

    observer.observe(staticElement, { childList: true, subtree: true });
  });
}
