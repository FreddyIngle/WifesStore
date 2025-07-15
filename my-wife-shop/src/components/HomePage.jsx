// src/pages/Home.jsx
import React from 'react';
import ShopManagerNav from './ShopManagerNav';
import ProductCard from './ProductCard';
import MiniCart from './/MiniCart';
import { useEffect,useState,useMemo } from 'react'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../supabaseClient'
import { signInWithGoogle } from './auth';
import { useCart } from "../context/CartContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faEtsy } from '@fortawesome/free-brands-svg-icons';
import UploadProduct from './UploadProduct';
import { useIsSeller } from '../hooks/useIsSeller';
import CheckoutPage from './CheckoutPage';
import { Link, useNavigate, Route,Routes } from 'react-router-dom';
import Developer from './Developer';

export default function HomePage() {

    const [user, setUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
     const { cartItemCount, cartLoaded } = useCart();//for cart item count
     const isSeller = useIsSeller(); // Custom hook to check if user is a seller
     //const [sellerOpen, setSellerOpen] = useState(false);
     //mini cart state
     //const [showMiniCart, setShowMiniCart] = useState(false);
     const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDevModal, setShowDevModal] = useState(false);
    // source of truth for the drawer
    const [cartOpen, setCartOpen] = useState(false);

     

 useEffect(() => {
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  fetchUser();

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null);
    
  });

  return () => subscription?.unsubscribe(); 

}, []);

//Fetch products from supabase
useEffect(() => {
    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*');
        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data);
        }
    }
    fetchProducts();
}, []);

// Functions to handle protected routes
const signIn = async () => {
    try {
        if (!user) {
            await signInWithGoogle();
        }
    }catch (error) {
        console.error("Error signing in:", error.message || error);
    }
};
const signOut = async () => {
    try {
        await supabase.auth.signOut();
        toast.success("Signed out successfully!");
        setUser(null);
        navigate('/');
        


        
    }catch (error) {
        console.error("Error signing out:", error.message || error);
    }
};



  

  //dummy data
  

    //const [products, setProducts] = useState(dummyProducts);
    // remove to rehaul products, coming from supabase

  const filteredProducts = products.filter(product =>
  product.title.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    //Routing
   
    

  <div className="flex flex-col h-screen bg-white relative">
    
   
     {/* SHOP MANAGER NAV (absolute overlay) */}
    {isSeller && (
      <div className="absolute top-0 left-0 z-30 flex-1 h-screen">
        <ShopManagerNav isSeller={isSeller} 
                        onLogout={signOut}
                        onUploadClick={() => setShowUploadModal(true)} 
                        onDevClick={() => setShowDevModal(true)}/>
      </div>
    )}
     {/* NAVBAR */}
     <div
        /* push right by 4 rem when collapsed, 16 rem when open */
        className={`flex flex-col flex-1 bg-white `}
                   
      >
    <div className="navbar bg-[#f9f9fb] text-gray-800 shrink-0">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Kyer's Handmades</a>
      </div>
      <div className="form-control">
        <div className="input input-bordered flex items-center gap-2 bg-white text-gray-800">
          <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="grow bg-transparent outline-none placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex-none flex gap-2 items-center">

        {/* Cart Icon Button */}
  <button
    className="btn btn-ghost btn-circle"
    onClick={() => {
      signIn();
        setCartOpen(true);
    }}
  >
    <div className="indicator">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {cartLoaded ? (
        <span className="badge badge-sm indicator-item">
          {cartItemCount}
        </span>
      ) : (
        <span className="cart-count-badge">...</span>
      )}
    </div>
  </button>



  {/* Mini Cart rendered OUTSIDE the button */}
  <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />

        {/* User Avatar */}
<div className="dropdown dropdown-end">
  <div tabIndex={0} role="button" className="avatar btn btn-ghost btn-circle">
    <div className="w-10 rounded-full">
      <img
  alt="User avatar"
  src={
    "https://www.gravatar.com/avatar/?d=mp" // Fallback placeholder
  }
/>
    </div>
  </div>
  <ul
    tabIndex={0}
    className="text-white dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
    <li onClick={signIn}><a>Account</a></li>
    <li onClick={user ? signOut : signIn}>
  <a>{user ? 'Sign Out' : 'Sign In'}</a>
</li>
  </ul>
</div>


        </div>

    </div>

    {/* SCROLLABLE PRODUCT GRID */}
    <div className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
       {products
  .filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map((product, idx) => (
    <ProductCard key={product.id || idx} {...product} signIn={signIn} />
))}

      </div>
    </div>

    {/* Upload Product Modal*/}
    <UploadProduct open={showUploadModal} onClose={() => setShowUploadModal(false)} />
    {/* Developer Modal*/}
    <Developer open={showDevModal} onClose={() => setShowDevModal(false)}/>
    



 

    
    {/* FOOTER (optional placeholder for now) */}
    <div className="shrink-0 border-t py-2 text-center text-sm text-gray-500">
  <div className="flex flex-col items-center">
    <p>© 2025 Kyer's Handmades. All rights reserved.</p>
    <div className="flex gap-4 mt-1">
      <a href="https://kyershandmades.etsy.com/" target="_blank" rel="noreferrer">
        <FontAwesomeIcon
          icon={faEtsy}
          className="text-orange-500 text-lg hover:scale-110 transition-transform"
        />
      </a>

      <a href="https://www.instagram.com/kyershandmades/" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faInstagram} className="text-pink-500 text-lg hover:scale-110 transition-transform" />
      </a>
    </div>
  </div>
</div>
<ToastContainer autoClose={2000}/>

 

  </div>
  </div>
  
 
);


}