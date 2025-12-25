import { useState, useCallback } from 'react';
import { APIError } from '@/lib/apiClient';
import { toast } from 'sonner';

interface UseApiCallOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

export function useApiCall<T>(
  options: UseApiCallOptions = {}
) {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Operation successful',
  } = options;

  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof APIError ? err : new APIError(500, 'Unknown error');
        setState({ data: null, loading: false, error });
        
        if (showErrorToast) {
          toast.error(error.message);
        }
        
        return null;
      }
    },
    [showErrorToast, showSuccessToast, successMessage]
  );

  return {
    ...state,
    execute,
  };
}
