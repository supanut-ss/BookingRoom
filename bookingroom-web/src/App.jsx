import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./app/AppRouter";
import { AuthProvider } from "./state/AuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
