import { createContext, useState, useCallback, useRef } from "react";
import Toast from "../components/common/Toast.jsx";

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  const removeToast = useCallback((toastId) => {
    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  const addToast = useCallback(
    ({ type = "info", message, duration = 4000 }) => {
      const newId = ++toastIdCounter.current;

      setToasts((previousToasts) => [
        ...previousToasts,
        { id: newId, type, message },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((previousToasts) =>
            previousToasts.filter((toast) => toast.id !== newId)
          );
        }, duration);
      }

      return newId;
    },
    []
  );

  const success = useCallback(
    (message) => addToast({ type: "success", message }),
    [addToast]
  );

  const danger = useCallback(
    (message) => addToast({ type: "danger", message }),
    [addToast]
  );

  const warning = useCallback(
    (message) => addToast({ type: "warning", message }),
    [addToast]
  );

  const info = useCallback(
    (message) => addToast({ type: "info", message }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, danger, warning, info }}
    >
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export { ToastContext, ToastProvider };
