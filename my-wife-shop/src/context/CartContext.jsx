import { createContext, useContext, useState, useMemo, useEffect, use } from "react";
import { supabase } from "../supabaseClient";
import { signInWithGoogle } from "../components/auth";

export const CartContext = createContext();

    

    export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
    };


    export function CartProvider({ children }) {
        const [cart, setCart] = useState([]);
        const [cartLoaded, setCartLoaded] = useState(false); // ← new state


       useEffect(() => {
  const fetchCart = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      setCart(data ?? []);
    } catch (err) {
      console.error("Cart fetch error:", err.message);
      setCart([]); // fallback
    } finally {
      setCartLoaded(true); // ✅ ensures loading state always finishes
    }
  };

  const loadCartIfLoggedIn = async (sess) => {
    if (sess?.user) await fetchCart(sess.user.id);
    else {
      setCart([]);
      setCartLoaded(true); // ✅ important
    }
  };

  // 1️⃣ Try current session
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) console.error("Session error:", error);
    loadCartIfLoggedIn(data?.session ?? null);
  });

  // 2️⃣ Listen for auth state changes
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    loadCartIfLoggedIn(session);
  });

  return () => listener.subscription.unsubscribe();
}, []);



    async function addToCart(product_id, title, quantity, custom_name, color_choice, price){

        const newItem = {
            product_id,
            quantity,
            custom_name,
            color_choice,
            title,
            price
        };
      setCart((prev) => [...prev, newItem]); // Update cart state immediately

      // Save to Supabase, wrap in try-catch for error handling
      const{
        data: { user },
        error,} = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Error fetching user or user not authenticated:", error);
        signInWithGoogle();
        return;
        
      }


      const {data, table_error} = await supabase
         .from("cart")
         .insert([
                {
                
                user_id:user.id, //uuid
                title, //text
                product_id: Number(product_id), //integer
                quantity:Number(quantity),
                custom_name,
                color_choice,
                price:Number(price),
                
                },
            ]);
            if(table_error) {
                console.error("Supabase insert error:", table_error);
            }
    }//end addToCart

    const calculateCartTotal = useMemo(() => {
        let total = 0;
        cart.forEach((item) => {
            total += item.quantity * item.price; // Assuming each item has a price property
        });
        return total.toFixed(2); // Return total as a string with 2 decimal places
    }, [cart]);//end calculateCartTotal

    //count for cart badge icon
    const cartItemCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
        }, [cart]);

    const value = {cart, addToCart, calculateCartTotal, cartItemCount, setCart, cartLoaded};
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;


 
};//end cartProvider