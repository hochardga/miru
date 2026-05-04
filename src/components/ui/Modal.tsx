import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export function Modal({ open, title, description, onClose }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
      panel
        ? Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
            .filter(
              (element) =>
                !element.hasAttribute("disabled") &&
                element.getAttribute("aria-hidden") !== "true",
            )
        : [];

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];

    if (firstElement) {
      firstElement.focus();
    } else {
      panel?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusableElements = getFocusableElements();

      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }

      const firstFocusable = currentFocusableElements[0];
      const lastFocusable =
        currentFocusableElements[currentFocusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstFocusable || activeElement === panel) {
          event.preventDefault();
          lastFocusable.focus();
        }
        return;
      }

      if (activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (
        previousFocusedElement &&
        previousFocusedElement.isConnected &&
        typeof previousFocusedElement.focus === "function"
      ) {
        previousFocusedElement.focus();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-text/25 p-4">
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="w-full max-w-md rounded-lg"
      >
        <div className="space-y-3">
          <h2 id={titleId} className="font-heading text-2xl">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-ink-muted">
            {description}
          </p>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
