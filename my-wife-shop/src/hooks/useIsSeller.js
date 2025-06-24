import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
const SELLER_ID = import.meta.env.VITE_SELLER_ID; 

export function useIsSeller() {
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    // initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSeller(user?.id === SELLER_ID);
    });
    if(!isSeller){
      console.log("Seller ID is not set or incorrect. Please check your environment variables.");
    }

    // listen for future auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setIsSeller(sess?.user?.id === SELLER_ID);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return isSeller;
}