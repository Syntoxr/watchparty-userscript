/**
 * Makes an HTML element draggable and dispatches a custom event when dragging ends.
 *
 * @param {HTMLElement} element - The element to make draggable.
 * @return {void}
 */
export function makeDraggable(element: HTMLElement) {
  let isDragging = false; // Indicates whether the element is being dragged
  let initialRight: number; // Initial right position of the element
  let initialTop: number; // Initial top position of the element
  let startX: number; // Initial X position of the mouse
  let startY: number; // Initial Y position of the mouse

  // Function to dispatch custom event when dragging ends
  function dispatchDragEndEvent(right: number, top: number) {
    const event = new CustomEvent("dragend", {
      detail: {
        right,
        top,
      },
    });
    element.dispatchEvent(event);
  }

  element.addEventListener("mousedown", (e: MouseEvent) => {
    isDragging = true;
    initialRight = parseFloat(window.getComputedStyle(element).right); // Get initial right position
    initialTop = parseFloat(window.getComputedStyle(element).top); // Get initial top position
    startX = e.clientX; // Get initial X position of the mouse
    startY = e.clientY; // Get initial Y position of the mouse
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e: MouseEvent) {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Calculate new positions
      let newRight = initialRight - deltaX;
      let newTop = initialTop + deltaY;

      // Ensure element stays within viewport boundaries
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      if (newRight < 0) {
        newRight = 0;
      } else if (
        newRight + elementWidth >
        document.documentElement.clientWidth
      ) {
        newRight = document.documentElement.clientWidth - elementWidth;
      }

      if (newTop < 0) {
        newTop = 0;
      } else if (newTop + elementHeight > window.innerHeight) {
        newTop = window.innerHeight - elementHeight;
      }

      // Update element position
      element.style.right = `${newRight}px`;
      element.style.top = `${newTop}px`;
    }
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      const currentRight = parseFloat(window.getComputedStyle(element).right); // Get current right position
      const currentTop = parseFloat(window.getComputedStyle(element).top); // Get current top position
      dispatchDragEndEvent(currentRight, currentTop); // Dispatch custom 'dragend' event with current coordinates
    }
  }
}
