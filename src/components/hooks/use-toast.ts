"use client";

import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  description?: string;
  duration?: number;
  [key: string]: any;
};

const useToast = () => {
  const toast = (
    title: string,
    options?: ToastOptions,
  ) => sonnerToast(title, options);
  
  toast.success = (title: string, options?: ToastOptions) => sonnerToast.success(title, options);
  toast.error = (title: string, options?: ToastOptions) => sonnerToast.error(title, options);
  toast.info = (title: string, options?: ToastOptions) => sonnerToast.info(title, options);

  return {
    toast,
  };
};

export { useToast };