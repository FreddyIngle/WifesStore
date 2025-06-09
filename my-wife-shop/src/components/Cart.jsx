import { createContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import App from '../App';
import { useMemo } from 'react';


 export const CartContext = createContext()


function Cart({ cart, setCart }) {

   
    const cartTotal = useMemo(() =>{
        return calculateCartTotal(cart);
    }, [cart]);

};


export default Cart;