import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState,useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useCart } from "../context/CartContext";
import { useNavigate } from 'react-router-dom';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
    const {cart, calculateCartTotal, setCart } = useCart();
     const navigate = useNavigate();
      const handleRedirectToSuccess = () => {
      navigate('/SuccessPage',{
        state: { cart }
      });
    };
    const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});



return (
    <div className='wrapper'>
        {/* ───── CART LIST ───── */}
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                    {cart.length === 0 ? (
                      <p className="py-10 text-center text-sm text-gray-500">
                        Your cart is empty.
                      </p>
                    ) : (
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cart.map((item) => (
                          <li key={item.id} className="flex py-6 ">
                            {/* placeholder thumbnail – swap in product image if you store it */}
                            <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3 className="line-clamp-2">{item.title}</h3>
                                  <p className="ml-4">{fmt.format(item.price)}</p>
                                </div>
                                {item.color_choice && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.color_choice}
                                    {item.custom_name && ` - ${item.custom_name}`}
                                  </p>
                                )}
                              </div>
                              <div className="mt-auto flex items-end justify-between text-sm">
                                <p className="text-gray-500">Qty {item.quantity}</p>

                               
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


    </div>
    )
    

}