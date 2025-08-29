
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "./hooks/useAuth";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProjectManagement from "@/pages/admin/ProjectManagement";
import AdminSupportAdministration from "@/pages/admin/SupportAdministration";
import AdminUserManagement from "@/pages/admin/UserManagement";
import AdminPartnerManagement from "@/pages/admin/PartnerManagement";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import PartnerDashboard from "@/pages/PartnerDashboard";
import PortfolioAdmin from "@/pages/PortfolioAdmin";
import ProjectsManagement from "@/pages/client/ProjectsManagement";
import SupportCenter from "@/pages/client/SupportCenter";
import BillingDashboard from "@/pages/client/BillingDashboard";
import EarningsManagement from "@/pages/partner/EarningsManagement";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, error, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Clear invalid tokens
  if (error && localStorage.getItem("auth_token")) {
    localStorage.removeItem("auth_token");
    window.location.reload();
    return null;
  }

  return (
    <Switch>
      {/* Public pages with Layout */}
      {!user ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Dashboard} />
      )}

      {/* Legal pages with Layout */}
      <Route path="/terminos">
        <Layout>
          <TermsOfService />
        </Layout>
      </Route>
      <Route path="/privacidad">
        <Layout>
          <PrivacyPolicy />
        </Layout>
      </Route>
      <Route path="/cookies">
        <Layout>
          <CookiePolicy />
        </Layout>
      </Route>

      {/* Admin routes - NO Layout (they use DashboardLayout) */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/portfolio" component={PortfolioAdmin} />
      <Route path="/admin/projects" component={AdminProjectManagement} />
      <Route path="/admin/support" component={AdminSupportAdministration} />
      <Route path="/admin/users" component={AdminUserManagement} />
      <Route path="/admin/partners" component={AdminPartnerManagement} />
      <Route path="/admin/analytics" component={AnalyticsDashboard} />

      {/* Client routes - NO Layout (they use DashboardLayout) */}
      <Route path="/client" component={ClientDashboard} />
      <Route path="/client/projects" component={ProjectsManagement} />
      <Route path="/client/support" component={SupportCenter} />
      <Route path="/client/billing" component={BillingDashboard} />

      {/* Partner routes - NO Layout (they use DashboardLayout) */}
      <Route path="/partner" component={PartnerDashboard} />
      <Route path="/partner/earnings" component={EarningsManagement} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
