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

        useEffect(() => {
        const fetchCart = async () => {
            const { data: {user}, error} = await supabase.auth.getUser();
            if (error || !user) {
                console.error("Error fetching user:", error);
                return;
            }
            const { data, error: fetchError } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", user.id);
            if (fetchError) {
                console.error("Error fetching cart items:", fetchError);
                return;
            }else{
                setCart(data);
            }
        }
        fetchCart();
    }, []);

    async function addToCart(product_id, title, quantity, custom_name, color_choice){

      setCart((prev) => [...prev, { product_id, title, quantity, custom_name, color_choice }]);

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

    const value = {cart, addToCart, calculateCartTotal, cartItemCount, setCart};
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;


 
};//end cartProvider