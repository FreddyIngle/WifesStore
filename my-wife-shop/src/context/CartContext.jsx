import { createContext, useContext, useState, useMemo, useEffect,useCallback } from "react";
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



    async function refetchCart(userId) {
  const { data, error } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId);

  if (!error) {
    // make sure id is a number so delete comparisons always match
    setCart(data.map((r) => ({ ...r, id: Number(r.id) })));
  } else {
    console.error('Refetch error:', error.message);
  }
}

/* ------------- main add-to-cart ------------- */
async function addToCart(
  product_id,
  title,
  quantity,
  custom_name,
  color_choice,
  price,
  image_url
) {
  /* 1️⃣ optimistic placeholder (optional but nice) */
  setCart((prev) => [
    ...prev,
    {
      temp: crypto.randomUUID(), // marker in case you do swap-in later
      product_id,
      quantity,
      custom_name,
      color_choice,
      title,
      price,
      image_url,
    },
  ]);

  /* 2️⃣ make sure we have a user */
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    console.error('Auth error:', userErr);
    signInWithGoogle();
    return;
  }

  /* 3️⃣ insert row */
  const { error: insertErr } = await supabase
    .from('cart')
    .insert([
      {
        user_id: user.id,
        title,
        product_id: Number(product_id),
        quantity: Number(quantity),
        custom_name,
        color_choice,
        price: parseFloat(price), // safer than Number()
        image_url
      },
    ]);

  if (insertErr) {
    console.error('Supabase insert error:', insertErr.message);
    // rollback optimistic UI if you want:
    // setCart(prev => prev.filter(i => i.temp !== tempKey));
    return;
  }

  /* 4️⃣ refetch so every row now carries the real id */
  await refetchCart(user.id);

  /* --- If you’d rather avoid the full refetch ---
     const { data: row } = await supabase
       .from('cart')
       .insert([{ …payload }])
       .select()
       .single();

     setCart(prev =>
       prev.map(i => (i.temp === tempKey ? { ...row, id: Number(row.id) } : i))
     );
  */
}

    const calculateCartTotal = useCallback(() => {
        let total = 0;
        cart.forEach((item) => {
            total += item.quantity * item.price;
        });
        return total.toFixed(2);
        }, [cart]);


    //count for cart badge icon
    const cartItemCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
        }, [cart]);

    const value = {cart, addToCart, calculateCartTotal, cartItemCount, setCart, cartLoaded};
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;


 
};//end cartProvider