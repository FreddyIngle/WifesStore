import React from "react";
import { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import App from '../App';
import { ToastContainer,toast } from 'react-toastify';
const Developer = ({open,onClose}) => {

   const [form, setForm] = useState({
    title: '',
    price: '',
    image_url: '',
    inventory: '',
    tag1: '',
    tag2: '',
    hasColor: false,
    hasEngraving: false,
    hasFont: false,
    user_id: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [devModeLocked, setDevModeLocked] = useState(false);

  

  //image upload state
  const [uploading, setUploading] = useState(false);
   const [imageFile, setImageFile] = useState(null);
const [imagePreview, setPreview] = useState(null);//

  




  if (!open) return null; // <-- mounted only when open

  const dummyProducts = [
  {
    id:1,
    title: 'Super Mario',
    image_url: 'https://i.etsystatic.com/35185215/r/il/ed8f68/6570779080/il_1588xN.6570779080_7ck2.jpg',
    price: 9.78,
    tag1: 'Keychain',
    tag2: 'Nintendo',
    inventory:5,
    has_engraving:true,
    has_color:true,
    has_font:false,
  },
  {
    id:2,
    title: 'Dead Pool',
    image_url: 'https://i.etsystatic.com/35185215/r/il/5b3f23/6570738782/il_1588xN.6570738782_rzjo.jpg',
    price: 9.78,
    tag1: 'Keychain',
    tag2: 'Marvel',
    inventory:10,
    has_engraving:true,
    has_color:true,
    has_font:false,
  },
  {
    id:3,
    title: 'Hello Kitty',
    image_url: 'https://i.etsystatic.com/35185215/c/1679/1679/290/1077/il/31fbcf/6290684146/il_600x600.6290684146_2qq0.jpg',
    price: 9.78,
    tag1: 'Keychain',
    tag2: 'Misc',
    inventory:20,
    has_engraving:true,
    has_color:true,
    has_font:false,
  },
  {
    id:4,
    title: 'Stitch',
    image_url: 'https://i.etsystatic.com/35185215/r/il/e1dbb4/5379852857/il_1588xN.5379852857_no5r.jpg',
    price: 10.78,
    tag1: 'Keychain',
    tag2: 'Disney',
    inventory:18,
    has_engraving:true,
    has_color:true,
    has_font:false,
  },
    {
        id:5,
    title: 'Unicorn',
    image_url: 'https://i.etsystatic.com/35185215/c/2250/1784/0/827/il/c71d8f/5379979751/il_600x600.5379979751_t46h.jpg',
    price: 9.78,
    tag1: 'Keychain',
    tag2: 'misc',
    inventory:10,
     has_engraving:true,
    has_color:true,
    has_font:false,
  },
    {
        id:6,
    title: 'Personalizeable Apron',
    image_url: 'https://i.etsystatic.com/35185215/r/il/088d51/5755881062/il_1588xN.5755881062_b6po.jpg',
    price: 19.86,
    tag1: 'Fashion',
    tag2: 'Apron',
    inventory:18,
    has_engraving:true,
    has_color:true,
    has_font:false,
  },
    {
        id:7,
    title: 'Stainless tumbler',
    image_url: 'https://i.etsystatic.com/35185215/r/il/408dcf/5682651676/il_1588xN.5682651676_ohjr.jpg',
    price: 33.75,
    tag1: 'Tumbler',
    tag2: 'Stainless',
   inventory:50,
   has_engraving:true,
    has_color:true,
    has_font:false,
  },
    {
        id:8,
    title: 'Spiderman',
    image_url: 'https://i.etsystatic.com/35185215/r/il/793e5f/6338858023/il_1588xN.6338858023_lwq6.jpg',
    price: 9.78,
    tag1: 'Keychain',
    tag2: 'Marvel',
    inventory:25,
    has_engraving:true,
    has_color:true,
    has_font:false,

  }
]

async function insertDummyProducts() {

     const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Not logged in or failed to get user:', userError);
    return;
  }
    

    const insert = dummyProducts.map(product => ({
      ...product,
    
   
      title: product.title,
      image_url: product.image_url,
      price: parseFloat(product.price),
      inventory: product.inventory ? Number(product.inventory) : 0,
      tag1: product.tag1,
      tag2: product.tag2,
      has_color: product.has_color,
      has_engraving: product.has_engraving,
      has_font: product.has_font,
        user_id: user.id, 

    }));

    const {error, data} = await 
    
    supabase.from('products').insert(insert);

    if (error) {
      console.error('Error inserting dummy products:', error);
    }
    else {
      console.log('Dummy products inserted successfully:', data);
    }
    toast.success("Products added!");
    toast.error("Error adding products!");



}
async function clearAllProducts() {
  const { error } = await supabase
    .from('products')
    .delete()
    .neq('id', 0); // Deletes all rows where id != 0 (i.e., all rows)

  if (error) {
    console.error('Error clearing products:', error);
    toast.error("Error clearing products.");
  } else {
    console.log('Products table cleared successfully.');
    toast.success("Products cleared!");
  }
}


  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-center items-center">
  


    
<div
  onClick={(e) => e.stopPropagation()}           /* keep backdrop click-to-close */
  className="
    relative z-50
    w-full max-w-lg h-[50vh] max-h-[90vh] overflow-y-auto
    rounded-xl bg-white/80 backdrop-blur-md shadow-2xl
    p-8 border border-gray-200 transition-all duration-300 ease-in-out scale-95 hover:scale-100
    text-base sm:text-sm leading-relaxed

  "
>
  {/* ─── Close (“X”) button ───────────────────────── */}
  <button
    type="button"
    onClick={onClose}
    className="
      absolute right-4 top-4
      inline-flex h-8 w-8 items-center justify-center
      rounded-full text-gray-400 transition
      hover:bg-gray-100 hover:text-gray-600
      focus:outline-none focus:ring-2 focus:ring-indigo-500
    "
  >
    <span className="sr-only">Close</span>
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </button>

  {/* ─── Heading (optional) ───────────────────────── */}
  <h2 className="mb-6 text-xl font-semibold text-gray-900">
  Developer 
</h2>

<div className="mb-4 flex items-center gap-2">
 


<label className="inline-flex items-center cursor-pointer mb-4">
  <input
    type="checkbox"
    className="sr-only peer"
    checked={devModeLocked}
    onChange={() => setDevModeLocked((prev) => !prev)}
  />
  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 
                  peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 
                  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                  after:start-[2px] after:bg-white after:border-gray-300 after:border 
                  after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                  peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
  </div>
  <span className="ms-3 text-sm font-medium text-black dark:text-black">
    Lock 
  </span>
</label>



  
</div>

<button  
    onClick={insertDummyProducts}
    disabled={devModeLocked}
    type=" button" 
    class={` focus:outline-none text-white bg-green-700 hover:bg-green-800 
            focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 
            dark:hover:bg-green-700 dark:focus:ring-green-800 
            transition transform duration-150 ease-out hover:scale-105
            ${devModeLocked ? 'opacity-50 cursor-not-allowed cur' : 'cursor-pointer '}`}>
    
    Push Script
    
    </button>

    <button  
    onClick={clearAllProducts}
    disabled={devModeLocked}
    type=" button" 
    class={`focus:outline-none text-white bg-red-700 hover:bg-red-800 
        focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 
        dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 
        transition transform duration-150 ease-out hover:scale-105
        ${devModeLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
>
    
    Delete All
    
    </button>



   

  
    </div>

   

   

</div>

    );
}
export default Developer;