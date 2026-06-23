import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import RoleRoute from './components/common/RoleRoute';
import Layout from './components/common/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import Login from './components/auth/Login';

import ProductReview from './components/admin/ProductReview';
import AdminProductList from './components/admin/ProductList';
import EditProduct from './components/user/EditProduct';
import MyProducts from './components/user/MyProducts';
import ProductForm from './components/user/ProductForm';
import ProductDetail from './components/user/ProductDetail';

function NotFound() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user?.role === 'Admin') return <Navigate to="/admin/products" replace />;
  if (user?.role === 'User') return <Navigate to="/user/products" replace />;
  return <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role === 'User') {
    return <Navigate to="/user/products" replace />;
  }

  if (user?.role === 'Admin') {
    return <Navigate to="/admin/products" replace />;
  }

  return <Navigate to="/login" replace />;
}

function LoginRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role === 'User') {
    return <Navigate to="/user/products" replace />;
  }

  if (user?.role === 'Admin') {
    return <Navigate to="/admin/products" replace />;
  }

  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/user/products"
        element={
          <RoleRoute allowedRoles={['User']}>
            <Layout><MyProducts /></Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/user/products/new"
        element={
          <RoleRoute allowedRoles={['User']}>
            <Layout><ProductForm /></Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/user/products/:id"
        element={
          <RoleRoute allowedRoles={['User']}>
            <Layout><ProductDetail /></Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/user/products/:id/edit"
        element={
          <RoleRoute allowedRoles={['User']}>
            <Layout><EditProduct /></Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RoleRoute allowedRoles={['Admin']}>
            <Layout><AdminProductList /></Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/products/:id/review"
        element={
          <RoleRoute allowedRoles={['Admin']}>
            <Layout><ProductReview /></Layout>
          </RoleRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
