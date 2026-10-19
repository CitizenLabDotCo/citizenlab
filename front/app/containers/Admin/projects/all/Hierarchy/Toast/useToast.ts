import { createContext, useContext } from 'react';

export type ToastContent = {
  message: string;
  // Puts back what the change replaced.
  undo?: () => void;
  error?: boolean;
};

export const ToastContext = createContext<(content: ToastContent) => void>(
  () => {}
);

// Says a change went through, or didn't, at the bottom of the page.
const useToast = () => useContext(ToastContext);

export default useToast;
