import { useCart } from "../context/CartContext";
import { supabase } from '../supabaseClient';
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon,TrashIcon } from '@heroicons/react/24/outline'

export default function MiniCart({ open, onClose }){

    const { cart, calculateCartTotal, setCart } = useCart();
    
    // helper to format USD prices (change locale / currency if you need)
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

    const handleRemoveItem = async (rawId) => {
            const id = Number(rawId);
            if (!Number.isFinite(id)) return;

            // optimistic UI
            setCart((prev) => prev.filter((item) => item.id !== id));

            const { error } = await supabase
                .from('cart')
                .delete()
                .eq('id', id);       // ← no user_id needed

            if (error) console.error('Delete failed:', error.message);
            };
    return (
<div>
     

      {/* ───── DRAWER ───── */}
      {open && (
      <Dialog open={open} onClose={() =>setOpen(false)} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              {/* Drawer panel */}
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col bg-white shadow-xl">
                  {/* ───── HEADER ───── */}
                  <div className="flex items-center justify-between px-4 py-6 sm:px-6">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Shopping cart
                    </DialogTitle>
                    <button
                      onClick={onClose}
                      className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 cursor-pointer transition transform duration-150 ease-out hover:scale-105 focus-visible:outline-none"
                    >
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon className="size-6" />
                    </button>
                  </div>

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

                                <button
                                  
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer 
                                  transition transform duration-150 ease-out
             hover:scale-105 hover:text-red-600 focus-visible:outline-none"
                                >
                                  <TrashIcon className="size-4" cursor="pointer"
                                   />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* ───── FOOTER ───── */}
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>{fmt.format(calculateCartTotal())}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Shipping and taxes calculated at checkout.
                    </p>

                    <div className="mt-6">
                      <button
                        disabled={cart.length === 0}
                        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600"
                      >
                        Checkout
                      </button>
                    </div>

                    <div className="mt-6 flex justify-center text-sm text-gray-500 ">
                      <button
                        type="button"
                        onClick={onClose}
                        className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer transition transform duration-150 ease-out hover:scale-105"
                      >
                        Continue Shopping →
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
      )}
    </div>
    );


};//end MiniCart 