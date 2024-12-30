import { toast } from "sonner";

export const authenticationFailed = (navigate) => {
  toast.error(
    `${
      import.meta.env.VITE_ASSISTANT +
      import.meta.env.VITE_AUTHENTICATION_FAILED_MSG
    } `
  );
  localStorage.removeItem("access_token");
  setTimeout(() => {
    navigate("/");
  }, 2000);
  return;
};
