import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Leaf, Menu, X, ChevronRight, Award, ShoppingBag, Star, Bell, Check } from 'lucide-react';

// Skeleton Component
const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
  </div>
);

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-emerald-800 to-emerald-900 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white text-lg md:text-xl font-bold"
          >
            <Leaf className="h-6 w-6 md:h-7 md:w-7" />
            <span className="font-sans tracking-tight">EcoShop India</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {[
              { path: '/', label: 'Home' },
              { path: '/products', label: 'Products' },
              { path: '/cart', label: 'Cart' },
              { path: '/profile', label: 'Profile' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-white text-sm font-medium transition-all duration-200 hover:text-emerald-200 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-emerald-200 after:transition-all after:duration-200 ${
                  location.pathname === path ? 'after:w-full' : 'after:w-0'
                } hover:after:w-full`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-1">
            {[
              { path: '/', label: 'Home' },
              { path: '/products', label: 'Products' },
              { path: '/cart', label: 'Cart' },
              { path: '/profile', label: 'Profile' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className="block py-2 px-4 text-white hover:bg-emerald-700 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{product.name}</h3>
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <span className="ml-1 text-gray-600 dark:text-gray-300">{product.rating}</span>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {product.tags.map(tag => (
          <span 
            key={tag}
            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-sm rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{product.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            CO2: {product.carbonEmission}kg
          </p>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          className="bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, linkTo, linkText }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
    <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-xl inline-block">
      <Icon className="h-8 w-8 text-emerald-800 dark:text-emerald-200" />
    </div>
    <h2 className="text-2xl font-bold mt-6 mb-4 text-gray-800 dark:text-white">{title}</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
    <Link
      to={linkTo}
      className="inline-flex items-center text-emerald-800 dark:text-emerald-200 hover:text-emerald-600 font-medium"
    >
      {linkText} <ChevronRight className="ml-2 h-4 w-4" />
    </Link>
  </div>
);

// Cart Context
const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
      {children}
      {showNotification && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-emerald-100 border border-emerald-500 text-emerald-800 rounded-lg p-4 flex items-start shadow-lg">
            <Check className="h-5 w-5 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium">Product Added to Cart!</h3>
              <p className="text-sm">Check your cart to complete the purchase.</p>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

// Home Page
const HomePage = () => (
  <div className="container mx-auto px-4 py-8 md:py-12">
    <div className="text-center mb-12 md:mb-16">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
        Welcome to EcoShop India
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Join our sustainable revolution for a greener Bharat
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <FeatureCard
        icon={Leaf}
        title="Sustainable Products"
        description="Every product in our store is carefully selected to minimize environmental impact."
        linkTo="/products"
        linkText="Browse Products"
      />
      <FeatureCard
        icon={ShoppingCart}
        title="Track Impact"
        description="See the real environmental impact of your purchases and how you're making a difference."
        linkTo="/cart"
        linkText="View Cart"
      />
      <FeatureCard
        icon={User}
        title="Personal Impact"
        description="Track your personal sustainability journey and see your contribution to the planet."
        linkTo="/profile"
        linkText="View Profile"
      />
    </div>
  </div>
);

// Products Page
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);
  

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-800 dark:text-white">
        Sustainable Products
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onAddToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

// Cart Page
const CartPage = () => {
  const { cartItems, setCartItems } = useContext(CartContext);

  const checkout = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 1, // Replace with actual userId after implementing authentication
        items: cartItems,
        totalAmount: totalPrice,
        totalCarbonImpact: totalImpact
      }),
    });
    
    if (response.ok) {
      // Clear cart and show success message
      setCartItems([]);
      // Add success notification
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    // Add error notification
  }
};

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const totalImpact = cartItems.reduce((acc, item) => acc + (item.carbonEmission * item.quantity), 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Your cart is empty</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center text-emerald-800 dark:text-emerald-200 hover:text-emerald-600"
          >
            Continue Shopping
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Shopping Cart</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">₹{item.price * item.quantity}</p>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    -
                  </button>
                  <span className="text-gray-800 dark:text-white font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  CO2 Impact: {(item.carbonEmission * item.quantity).toFixed(2)}kg
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>CO2 Impact</span>
              <span>{totalImpact.toFixed(2)}kg</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-4 font-bold text-gray-800 dark:text-white">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>
            
            <button className="w-full bg-emerald-800 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace 1 with actual userId after implementing authentication
    fetch('http://localhost:5000/api/users/1')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <User className="h-8 w-8 mr-3 text-emerald-800 dark:text-emerald-200" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Profile
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
              <p className="text-lg font-medium text-gray-800 dark:text-white">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-lg font-medium text-gray-800 dark:text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Member Since</label>
              <p className="text-lg font-medium text-gray-800 dark:text-white">
                {new Date(user.memberSince).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900 rounded-lg p-4 text-center">
              <Leaf className="h-6 w-6 mx-auto mb-2 text-emerald-800 dark:text-emerald-200" />
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{user.carbonSaved}kg</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">CO2 Saved</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900 rounded-lg p-4 text-center">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-emerald-800 dark:text-emerald-200" />
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{user.sustainablePurchases}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Eco Purchases</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {user.milestones.map(milestone => (
              <div key={milestone.id} className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <Award className={`w-6 h-6 ${
                  milestone.completed ? 'text-emerald-800 dark:text-emerald-200' : 'text-gray-400'
                }`} />
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">{milestone.title}</p>
                  {!milestone.completed && (
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                      <div 
                        className="h-2 bg-emerald-800 rounded-full transition-all duration-300"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <main className="pb-12">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <footer className="bg-emerald-800 dark:bg-emerald-900 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">EcoShop</h3>
                  <p className="text-emerald-100">
                    Making sustainable shopping accessible to everyone.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><Link to="/products" className="text-emerald-100 hover:text-white">Products</Link></li>
                    <li><Link to="/cart" className="text-emerald-100 hover:text-white">Cart</Link></li>
                    <li><Link to="/profile" className="text-emerald-100 hover:text-white">Profile</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Contact</h3>
                  <p className="text-emerald-100">Email: support@ecoshop.com</p>
                  <p className="text-emerald-100">Phone: (555) 123-4567</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-emerald-700 text-center text-emerald-100">
                © 2024 EcoShop. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </Router>
  );
};

export default App;