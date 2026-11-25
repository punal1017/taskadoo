import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.code === "ERR_NETWORK") {
      return "Could not reach the Taskadoo API. Start the backend on port 3000 and check NEXT_PUBLIC_API_BASE_URL.";
    }
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
};
