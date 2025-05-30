import { QueryClient } from "@tanstack/react-query";

export const LSQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
