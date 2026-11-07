import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import PaymentGateway from './components/PaymentGateway';
import OrderConfirmation from './components/OrderConfirmation';
import AddProduct from './components/AddProduct';
import MyOrders from './components/MyOrders';
import OrderDetails from './components/OrderDetails';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('nexacart_user')) || null;
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const addToCart = (product) => {
    const updatedCart = [...cartItems];
    const existingIndex = updatedCart.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`✓ ${product.name || product.title || "Product"} added to cart!`);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const handleProductAdded = () => {
    setRefreshFlag(!refreshFlag);
    toast.success("✅ Product added to inventory successfully!");
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('nexacart_user', JSON.stringify(userData));
    setCurrentUser(userData);
    toast.success(`Welcome, ${userData.name}! Logged in as ${userData.role === 'admin' ? 'Administrator' : 'Customer'}.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexacart_user');
    setCurrentUser(null);
    toast.info("Logged out successfully.");
  };

  return (
    <Router>
      {/* Header is shown on store and admin pages when logged in */}
      {currentUser && (
        <Header 
          cartItems={cartItems} 
          setSearchTerm={setSearchTerm}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      <Routes>
        {/* Authentication Gateway */}
        <Route 
          path="/login" 
          element={<Login onLogin={handleLoginSuccess} />} 
        />

        {/* If user is not logged in, all routes redirect to /login */}
        {!currentUser ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <>
            {/* Customer Store Pages */}
            <Route 
              path="/" 
              element={
                <ProductList 
                  addToCart={addToCart} 
                  refreshFlag={refreshFlag} 
                  searchTerm={searchTerm} 
                />
              } 
            />

            <Route 
              path="/product/:id" 
              element={<ProductDetails addToCart={addToCart} />} 
            />

            <Route 
              path="/cart" 
              element={<Cart cartItems={cartItems} updateCartItems={setCartItems} />} 
            />

            <Route 
              path="/payment" 
              element={
                <PaymentGateway 
                  cartItems={cartItems} 
                  updateCartItems={setCartItems} 
                  clearCart={clearCart} 
                />
              } 
            />

            <Route 
              path="/order-confirmation" 
              element={
                <OrderConfirmation 
                  addToCart={addToCart} 
                  clearCart={clearCart} 
                />
              } 
            />

            <Route path="/orders" element={<MyOrders />} />
            <Route path="/order/:id" element={<OrderDetails />} />

            {/* Customer User Profile (Google Maps, Addresses, Payments) */}
            <Route 
              path="/profile" 
              element={
                <UserProfile 
                  currentUser={currentUser} 
                  onUpdateUser={(updated) => {
                    setCurrentUser(updated);
                    localStorage.setItem('nexacart_user', JSON.stringify(updated));
                  }} 
                />
              } 
            />

            {/* Admin Intelligence Suite (Restricted to Admin Role) */}
            <Route 
              path="/admin" 
              element={currentUser.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/admin/:tab" 
              element={currentUser.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
            />

            <Route 
              path="/add-product" 
              element={currentUser.role === 'admin' ? <AddProduct onProductAdded={handleProductAdded} /> : <Navigate to="/" replace />} 
            />

            <Route path="*" element={<Navigate to={currentUser.role === 'admin' ? '/admin' : '/'} replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
