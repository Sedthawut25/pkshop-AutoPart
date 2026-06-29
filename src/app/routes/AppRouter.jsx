// src/app/routes/AppRouter.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import { authStorage } from "../../utils/authStorage";

import DashboardPage from "../../pages/admin/DashboardPage";
import AdminLayout from "../../components/layouts/AdminLayout";
import LoginPage from "../../pages/auth/LoginPage";
import AdminPoListPage from "../../pages/admin/purchaseOrder/AdminPoListPage";
import AdminPoDetailPage from "../../pages/admin/purchaseOrder/AdminPoDetailPage";
import AdminPoCreatePage from "../../pages/admin/purchaseOrder/AdminPoCreatePage";
import AdminQuotationDetailPage from "../../pages/admin/purchaseOrder/AdminQuotationDetailPage";
import AdminImportFromQuotationPage from "../../pages/admin/import/AdminImportFromQuotationPage";
import AdminImportLotsPage from "../../pages/admin/import/AdminImportLotsPage";
import AdminImportLotDetailPage from "../../pages/admin/import/AdminImportLotDetailPage";

import CustomsLoginPage from "../../pages/customs/CustomsLoginPage";
import CustomsLayout from "../../components/layouts/CustomsLayout";
import CustomsDocumentsPage from "../../pages/customs/CustomsDocumentsPage";
import CustomsDocumentDetailPage from "../../pages/customs/CustomsDocumentDetailPage";

import AdminProductsPage from "../../pages/admin/products/AdminProductsPage";
import AdminOrdersPage from "../../pages/admin/orders/AdminOrdersPage";
import AdminOrderDetailPage from "../../pages/admin/orders/AdminOrderDetailPage";

import AdminCategoriesPage from "../../pages/admin/master/AdminCategoriesPage";
import AdminCarBrandsPage from "../../pages/admin/master/AdminCarBrandsPage";
import AdminCarModelsPage from "../../pages/admin/master/AdminCarModelsPage";
import AdminPromotionsPage from "../../pages/admin/promotions/AdminPromotionsPage";
import AdminCustomerPage from "../../pages/admin/customer/AdminCustomerPage";
import AdminSupplierPage from "../../pages/admin/suppiler/AdminSupplierPage";
import AdminReviewPage from "../../pages/admin/review/AdminReviewPage";
import AdminRequestPage from "../../pages/admin/request/AdminRequestPage";

import SupplierLayout from "../../pages/supplier/SupplierLayout";
import SupplierPoListPage from "../../pages/supplier/purchaseorders/SupplierPoListPage";
import SupplierPoDetailPage from "../../pages/supplier/purchaseorders/SupplierPoDetailPage";
import SupplierRegisterPage from "../../pages/auth/SupplierRegisterPage";

import CustomerLoginPage from "../../pages/customer/auth/CustomerLoginPage";
import CustomerRegisterPage from "../../pages/customer/auth/CustomerRegisterPage";
import CustomerLayout from "../../pages/customer/CustomerLayout";
import CustomerHomePage from "../../pages/customer/CustomerHomePage";
import CustomerShopPage from "../../pages/customer/CustomerShopPage";
import CustomerProductDetailPage from "../../pages/customer/CustomerProductDetailPage";
import CustomerCartPage from "../../pages/customer/CustomerCartPage";
import CustomerCheckoutPage from "../../pages/customer/CustomerCheckoutPage";
import PaymentSuccessPage from "../../pages/customer/PaymentSuccessPage";
import MyOrderPage from "../../pages/customer/MyOrderPage";
import CustomerOrderDetailPage from "../../pages/customer/CustomerOrderDetailPage";
import CustomerHistoryPage from "../../pages/customer/CustomerHistoryPage";
import CustomerHistoryDetailPage from "../../pages/customer/CustomerHistoryDetailPage";
import CustomerRequestPage from "../../pages/customer/CustomerRequestPage";
import CustomerClaimsPage from "../../pages/customer/CustomerClaimsPage";
import AdminClaimsPage from "../../pages/admin/claims/AdminClaimsPage";

function Placeholder({ title }) {
  return <div className="p-6">{title}</div>;
}

function HomeRedirect() {
  const token = authStorage.token();
  const role = authStorage.role();

  if (!token) return <Navigate to="/login" replace />;
  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (role === "SUPPLIER") return <Navigate to="/supplier/po" replace />;
  if (role === "CUSTOMS") return <Navigate to="/customs/documents" replace />;

  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customs/login" element={<CustomsLoginPage />} />

          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
        </Route>

        <Route path="/403" element={<Placeholder title="403 Forbidden" />} />

        {/* admin */}
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />

            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route
              path="/admin/orders/:orderId"
              element={<AdminOrderDetailPage />}
            />

            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/car-brands" element={<AdminCarBrandsPage />} />
            <Route path="/admin/car-models" element={<AdminCarModelsPage />} />

            <Route path="/admin/promotions" element={<AdminPromotionsPage />} />

            <Route path="/admin/po" element={<AdminPoListPage />} />
            <Route path="/admin/po/new" element={<AdminPoCreatePage />} />
            <Route path="/admin/po/:poId" element={<AdminPoDetailPage />} />
            <Route
              path="/admin/po/:poId/quotations/:quotationId"
              element={<AdminQuotationDetailPage />}
            />

            <Route
              path="/admin/import/from-quotation/:poId/:quotationId"
              element={<AdminImportFromQuotationPage />}
            />
            <Route
              path="/admin/import/lots"
              element={<AdminImportLotsPage />}
            />
            <Route
              path="/admin/import/lots/:lotId"
              element={<AdminImportLotDetailPage />}
            />
            <Route path="/admin/member" element={<AdminCustomerPage />} />
            <Route path="/admin/supplier" element={<AdminSupplierPage />} />
            <Route path="/admin/reviews" element={<AdminReviewPage />} />
            <Route path="/admin/request" element={<AdminRequestPage />} />
            <Route path="/admin/claims" element={<AdminClaimsPage/> }/>
          </Route>
        </Route>

        {/* customs */}
        <Route element={<ProtectedRoute roles={["CUSTOMS"]} />}>
          <Route element={<CustomsLayout />}>
            <Route
              path="/customs/documents"
              element={<CustomsDocumentsPage />}
            />
            <Route
              path="/customs/documents/:docId"
              element={<CustomsDocumentDetailPage />}
            />
          </Route>
        </Route>

        <Route path="/supplier/register" element={<SupplierRegisterPage />} />
        <Route element={<ProtectedRoute roles={["SUPPLIER"]} />}>
          <Route path="/supplier" element={<SupplierLayout />}>
            <Route index element={<Navigate to="po" replace />} />

            <Route path="po" element={<SupplierPoListPage />} />
            <Route path="po/:poId" element={<SupplierPoDetailPage />} />
          </Route>
        </Route>

        {/* ✅ customer */}
        <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerHomePage />} />
            <Route path="shop" element={<CustomerShopPage />} />
            <Route
              path="/customer/product/:id"
              element={<CustomerProductDetailPage />}
            />
            <Route path="cart" element={<CustomerCartPage />} />
            <Route path="checkout" element={<CustomerCheckoutPage />} />
            <Route path="orders" element={<MyOrderPage />} />
            <Route
              path="/customer/orders/:orderId"
              element={<CustomerOrderDetailPage />}
            />
            <Route path="history" element={<CustomerHistoryPage />} />
            <Route path="/customer/history/:historyId" element={<CustomerHistoryDetailPage/>}/>
            <Route path="requests" element={<CustomerRequestPage/>} />
            <Route path="/customer/claims" element={<CustomerClaimsPage/>} />
          </Route>
        </Route>
        <Route path="/success" element={<PaymentSuccessPage />} />

        <Route path="*" element={<Placeholder title="Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}
