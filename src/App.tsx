import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Quotations from "./pages/Quotations";
import QuotationForm from "./pages/QuotationForm";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import TaxInvoices from "./pages/TaxInvoices";
import TaxInvoiceForm from "./pages/TaxInvoiceForm";
import Settings from "./pages/Settings";
import Financial from "./pages/Financial";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import InvitationAccept from "./pages/InvitationAccept";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ServiceRequest from "./pages/ServiceRequest";
import ServiceDashboard from "./pages/ServiceDashboard";
import Delivery from "./pages/Delivery";
import SalesDocuments from "./pages/SalesDocuments";
import StaffManagement from "./pages/StaffManagement";
import Receipts from "./pages/Receipts";
import ReceiptForm from "./pages/ReceiptForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/invitation" element={<InvitationAccept />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/quotations" element={
              <ProtectedRoute>
                <Quotations />
              </ProtectedRoute>
            } />
            <Route path="/quotations/new" element={
              <ProtectedRoute>
                <QuotationForm />
              </ProtectedRoute>
            } />
            <Route path="/quotations/:id/edit" element={
              <ProtectedRoute>
                <QuotationForm />
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            } />
            <Route path="/invoices/new" element={
              <ProtectedRoute>
                <InvoiceForm />
              </ProtectedRoute>
            } />
            <Route path="/invoices/:id" element={
              <ProtectedRoute>
                <InvoiceForm />
              </ProtectedRoute>
            } />
            <Route path="/tax-invoices" element={
              <ProtectedRoute>
                <TaxInvoices />
              </ProtectedRoute>
            } />
            <Route path="/tax-invoices/new" element={
              <ProtectedRoute>
                <TaxInvoiceForm />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/service-request" element={
              <ProtectedRoute>
                <ServiceRequest />
              </ProtectedRoute>
            } />
            <Route path="/service-dashboard" element={
              <ProtectedRoute>
                <ServiceDashboard />
              </ProtectedRoute>
            } />
            <Route path="/delivery" element={
              <ProtectedRoute>
                <Delivery />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/financial" element={
              <ProtectedRoute>
                <Financial />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/sales-documents" element={
              <ProtectedRoute>
                <SalesDocuments />
              </ProtectedRoute>
            } />
            <Route path="/staff-management" element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            } />
            <Route path="/receipts" element={
              <ProtectedRoute>
                <Receipts />
              </ProtectedRoute>
            } />
            <Route path="/receipts/new" element={
              <ProtectedRoute>
                <ReceiptForm />
              </ProtectedRoute>
            } />
            <Route path="/receipts/:id" element={
              <ProtectedRoute>
                <ReceiptForm />
              </ProtectedRoute>
            } />
            <Route path="/receipts/:id/edit" element={
              <ProtectedRoute>
                <ReceiptForm />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
