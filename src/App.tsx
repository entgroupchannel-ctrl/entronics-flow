import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Quotations from "./pages/Quotations";
import QuotationForm from "./pages/QuotationForm";
import QuotationImport from "./pages/QuotationImport";
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
import PaymentRecords from "./pages/PaymentRecords";
import InternationalTransfer from "./pages/InternationalTransfer";
import SupplierManagement from "./pages/SupplierManagement";
import PurchaseOrders from "./pages/PurchaseOrders";
import CustomerRegistration from "./pages/CustomerRegistration";

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
            <Route path="/customer-registration" element={<CustomerRegistration />} />
            <Route path="/invitation" element={<InvitationAccept />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotations" element={
              <ProtectedRoute>
                <Layout>
                  <Quotations />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotations/new" element={
              <ProtectedRoute>
                <Layout>
                  <QuotationForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotations/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <QuotationForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotations/import" element={
              <ProtectedRoute>
                <Layout>
                  <QuotationImport />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/invoices/new" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/invoices/:id" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tax-invoices" element={
              <ProtectedRoute>
                <Layout>
                  <TaxInvoices />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tax-invoices/new" element={
              <ProtectedRoute>
                <Layout>
                  <TaxInvoiceForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tax-invoices/:id" element={
              <ProtectedRoute>
                <Layout>
                  <TaxInvoiceForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tax-invoices/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <TaxInvoiceForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/service-request" element={
              <ProtectedRoute>
                <Layout>
                  <ServiceRequest />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/service-dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <ServiceDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/delivery" element={
              <ProtectedRoute>
                <Layout>
                  <Delivery />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/financial" element={
              <ProtectedRoute>
                <Layout>
                  <Financial />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sales-documents" element={
              <ProtectedRoute>
                <Layout>
                  <SalesDocuments />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff-management" element={
              <ProtectedRoute>
                <Layout>
                  <StaffManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/receipts" element={
              <ProtectedRoute>
                <Layout>
                  <Receipts />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/receipts/new" element={
              <ProtectedRoute>
                <Layout>
                  <ReceiptForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/receipts/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ReceiptForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/receipts/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <ReceiptForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/payment-records" element={
              <ProtectedRoute>
                <Layout>
                  <PaymentRecords />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/international-transfer" element={
              <ProtectedRoute>
                <Layout>
                  <InternationalTransfer />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/supplier-management" element={
              <ProtectedRoute>
                <Layout>
                  <SupplierManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/purchase-orders" element={
              <ProtectedRoute>
                <Layout>
                  <PurchaseOrders />
                </Layout>
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
