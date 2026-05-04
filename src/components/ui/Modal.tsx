import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export function Modal({ open, title, description, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-text/25 p-4">
      <Panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="phase0-modal-title"
        className="w-full max-w-md rounded-lg"
      >
        <div className="space-y-3">
          <h2 id="phase0-modal-title" className="font-heading text-2xl">
            {title}
          </h2>
          <p className="text-sm text-ink-muted">{description}</p>
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
