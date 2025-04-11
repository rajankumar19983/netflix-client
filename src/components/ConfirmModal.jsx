import React from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
