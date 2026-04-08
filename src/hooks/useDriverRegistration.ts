import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/expo";
import { createAuthenticatedAPI } from "@/services/api";
import { DriverRegistrationData } from "@/types/auth.types";
import { useDriverStore } from "@/store/driverStore";

export function useDriverRegistration() {
  const queryClient = useQueryClient();
  const { setDriver } = useDriverStore();
  const { getToken } = useAuth();
  const api = createAuthenticatedAPI(getToken);

  const registerMutation = useMutation({
    mutationFn: (data: DriverRegistrationData) => api.registerDriver(data),
    onSuccess: (response: any) => {
      setDriver(response.data);
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
    },
  });

  return {
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isLoading: registerMutation.isPending,
    error: registerMutation.error,
    isSuccess: registerMutation.isSuccess,
  };
}

export function useDriverProfile() {
  const { isLoaded, isSignedIn } = useAuth();
  const { getToken } = useAuth();
  const api = createAuthenticatedAPI(getToken);

  return useQuery({
    queryKey: ["driver", "profile"],
    queryFn: () => api.getProfile(),
    enabled: isLoaded && isSignedIn,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createAuthenticatedAPI(getToken);

  const mutation = useMutation({
    mutationFn: api.updateUserProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
      return response;
    },
  });

  return mutation;
}

export function useUploadDriverDocument() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createAuthenticatedAPI(getToken);

  return useMutation({
    mutationFn: api.uploadDriverDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
    },
  });
}
