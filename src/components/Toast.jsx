import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    // Masquer la notification automatiquement après 3 secondes
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bgColors = {
    success: "bg-emerald-600",
    error: "bg-rose-600",
    info: "bg-blue-600",
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-50 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 ${
        bgColors[type] || bgColors.info
      }`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 font-bold ml-2"
      >
        ✕
      </button>
    </div>
  );
}
