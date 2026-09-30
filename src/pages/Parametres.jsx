import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";

export default function Parametres() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "clair"
  );
  const [notificationsActives, setNotificationsActives] = useState(
    () => localStorage.getItem("notifications") !== "false"
  );
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (theme === "sombre") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "sombre");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "clair");
    }
  }, [theme]);

  const handleToggleNotifications = (e) => {
    const val = e.target.checked;
    setNotificationsActives(val);
    localStorage.setItem("notifications", val ? "true" : "false");
    setNotification({
      message: val ? "Notifications activées" : "Notifications désactivées",
      type: "info",
    });
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 space-y-6">
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white pb-4 border-b border-gray-200 dark:border-gray-700">
        Paramètres de l'application
      </h2>

      {/* Thème d'affichage */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Thème d'affichage
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choisissez l'apparence de votre interface
          </p>
        </div>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="clair">Clair ☀️</option>
          <option value="sombre">Sombre 🌙</option>
        </select>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Preference des Notifications Toast */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Notifications Toast
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Activer les messages d'alerte lors des actions
          </p>
        </div>
        <input
          type="checkbox"
          checked={notificationsActives}
          onChange={handleToggleNotifications}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>
    </div>
  );
}