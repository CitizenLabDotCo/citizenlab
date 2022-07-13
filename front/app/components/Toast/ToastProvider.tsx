import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Toast, { ToastProps } from './index';

export const ToastContext = React.createContext<{
  add: (toast: Omit<ToastProps, 'onDismiss'>) => void;
  remove: () => void;
}>({ add: () => {}, remove: () => {} });

const ToastProvider = ({ children }) => {
  const { pathname } = useLocation();
  const [toast, setToast] = React.useState<Omit<
    ToastProps,
    'onDismiss'
  > | null>(null);

  useEffect(() => {
    // Remove toast on route change
    remove();
  }, [pathname]);

  useEffect(() => {
    let timeout;
    if (toast?.variant === 'success') {
      timeout = setTimeout(() => remove(), 2500);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [toast]);

  const add = ({ variant, text }: Omit<ToastProps, 'onDismiss'>) => {
    setToast({ variant, text });
  };

  const remove = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}

      {toast && (
        <Toast onDismiss={remove} variant={toast.variant} text={toast.text} />
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
