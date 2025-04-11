// confirm.js
import React from "react";
import { createRoot } from "react-dom/client";
import ConfirmModal from "./ConfirmModal.jsx";

export function confirm(message) {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      root.unmount();
      container.remove();
    };

    root.render(
      <ConfirmModal
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  });
}
