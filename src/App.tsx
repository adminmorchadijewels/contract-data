import { Component, type ReactNode, type ErrorInfo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleProvider } from "@/lib/RoleContext";
import { AuthProvider } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import ContractsPage from "./pages/Contracts";
import SettingsPage from "./pages/Settings";
import AssistantPage from "./pages/Assistant";
import QueryPage from "./pages/Query";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// ── Error Boundary ────────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Intentionally not logging to avoid leaking stack traces in production
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">An unexpected error occurred. Please reload the page.</p>
            <button
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.3 }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => {
  return (
    <ErrorBoundary>
    <AuthProvider>
    <RoleProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </RoleProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
