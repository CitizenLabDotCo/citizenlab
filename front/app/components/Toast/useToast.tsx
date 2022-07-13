import { useContext } from 'react';
import { ToastContext } from './ToastProvider';

const useToast = () => useContext(ToastContext);

export default useToast;
