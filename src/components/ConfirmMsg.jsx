import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const ConfirmMsg = ({
  open,
  title = "Confirm",
  message,
  description,
  confirmText = "Yes",
  cancelText = "Cancel",
  showCancel = true,
  variant = "delete",
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);

  const config = {
    delete: {
      icon: ExclamationCircleIcon,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-red-500 hover:bg-red-600",
    },
    activate: {
      icon: CheckCircleIcon,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      button: "bg-green-500 hover:bg-green-600",
    },
  };

  const current = config[variant] || config.delete;
  const Icon = current.icon;

  useEffect(() => {
    if (!open) setLoading(false);
  }, [open]);

  const handleConfirm = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-[450px] p-8 relative shadow-xl">
          <button
            onClick={onCancel}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <Dialog.Title className="text-xl font-semibold mb-10">
            {title}
          </Dialog.Title>
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${current.bg}`}>
              <Icon className={`w-10 h-10 ${current.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                {message}
              </h3>
              {description && <p className="text-gray-600 text-lg leading-relaxed">{description}</p>}
            </div>
          </div>
          <div className="flex justify-end mt-5 gap-3">
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 text-lg font-medium rounded-full bg-gray-200 hover:bg-gray-300"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`px-8 py-3 text-lg font-medium rounded-full ${loading
                ? "bg-yellow-400 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500"
                }`}
            >
              {loading ? "..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmMsg;
