import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../Lib/api.js";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser", "users"],
    queryFn: getAuthUser,
    retry: false,
  });
  return { authLoading: authUser.isLoading, authUser: authUser.data };
};

export default useAuthUser;
