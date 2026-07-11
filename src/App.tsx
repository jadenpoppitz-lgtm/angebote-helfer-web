import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import Landing from "./pages/Landing.tsx";

const DemoPage = lazy(() => import("./pages/DemoPage.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));
const LegalPage = lazy(() => import("./pages/LegalPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Produzent = lazy(() => import("./pages/Produzent.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-[#f8fbf6]" />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/problem" element={<Landing page="problem" />} />
              <Route path="/produkt" element={<Landing page="product" />} />
              <Route path="/erfolge" element={<Landing page="traction" />} />
              <Route path="/kreislauf-demo" element={<Landing page="cycle" />} />
              <Route path="/traction" element={<Navigate to="/erfolge" replace />} />
              <Route path="/zyklus" element={<Navigate to="/kreislauf-demo" replace />} />
              <Route path="/impressum" element={<LegalPage kind="imprint" />} />
              <Route path="/datenschutz" element={<LegalPage kind="privacy" />} />
              <Route path="/barrierefreiheit" element={<LegalPage kind="accessibility" />} />
              <Route path="/angebote" element={<Index />} />
              <Route path="/produzent" element={<Produzent />} />
              <Route path="/demo/:role" element={<DemoPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
