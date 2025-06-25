import React, { use } from 'react';
import { supabase } from '../supabaseClient'; // Adjust the path as necessary

import { useNavigate } from 'react-router-dom'; // For navigation
import { toast } from 'react-toastify'; // For notifications
import { CartProvider } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { uploadImageToBucket} from '../utils/uploadImage'; 
 //dummy data
  

const UploadProduct = ({open, onClose}) => {

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

  //image upload state
  const [uploading, setUploading] = useState(false);
   const [imageFile, setImageFile] = useState(null);
const [imagePreview, setPreview] = useState(null);//

  const handleChange = (e) =>{
    const { name, value, type, checked } = e.target;
   setForm((prev) => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value,
  }));
  }
  


  async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  if (!form.title || !form.price) {
    setError('Title and price required'); return;

  }
  const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  throw new Error('You must be logged in to submit a product.');
}

  setSaving(true);
  try {
    /* 1️⃣  upload image if selected */
    let publicUrl = null;
    if (imageFile) publicUrl = await uploadImageToBucket(imageFile);

    /* 2️⃣  insert row */
    const { error } = await supabase.from('products').insert([
      {
        title: form.title,
        price: parseFloat(form.price),
        inventory: form.inventory ? Number(form.inventory) : 0,
        image_url: publicUrl,
        tag1: form.tag1,
        tag2: form.tag2,
        has_color: form.hasColor,
        has_engraving: form.hasEngraving,
        has_font: form.hasFont,
        user_id: user.id,
      },
    ]);

    if (error) throw error;

    /* 3️⃣  reset + close */
    setForm({
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
    toast.success('Product submitted!');
    setImageFile(null); setPreview(null);
    //onClose(); removed to prevent close on submit
  } catch (err) {
    setError(err.message);
  }
  setSaving(false);
}


  if (!open) return null; // <-- mounted only when open

  

  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-center items-center">
  


    
<div
  onClick={(e) => e.stopPropagation()}           /* keep backdrop click-to-close */
  className="
    relative z-50
    w-full max-w-lg max-h-[90vh] overflow-y-auto
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
  Seller Dashboard
</h2>

  {/* ─── Form ─────────────────────────────────────── */}
  <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">

    {/* Product title */}
    <div className="relative z-0 w-full group">
      <input
        type="text"
        name="title"
        id="title"
        value={form.title}
        onChange={handleChange}
        placeholder=" "
        required
        className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent
                   py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
      />
      <label
        htmlFor="title"
        className="absolute top-3 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 transition-all
                   peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                   peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
      >
        Product title
      </label>
    </div>

    {/* Price */}
    <div className="relative z-0 w-full group">
      <input
        type="number"
        step="0.01"
        name="price"
        id="price"
        value={form.price}
        onChange={handleChange}
        placeholder=" "
        required
        className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent
                   py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
      />
      <label
        htmlFor="price"
        className="absolute top-3 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 transition-all
                   peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                   peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
      >
        Price&nbsp;(USD)
      </label>
    </div>

    {/* Inventory */}
    <div className="relative z-0 w-full group">
      <input
        type="number"
        name="inventory"
        id="inventory"
        value={form.inventory}
        onChange={handleChange}
        placeholder=" "
        className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent
                   py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
      />
      <label
        htmlFor="inventory"
        className="absolute top-3 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 transition-all
                   peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                   peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
      >
        Inventory&nbsp;(qty)
      </label>
    </div>

    {/* ─── Tags ───────────────────────────────────────── */}
<div className="grid grid-cols-2 gap-4">
  {['tag1','tag2'].map((t) => (
    <div key={t} className="relative z-0 w-full group">
      <input
        type="text"
        name={t}
        id={t}
        value={form[t]}
        onChange={handleChange}
        placeholder=" "
        className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent
                   py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
      />
      <label
        htmlFor={t}
        className="absolute top-3 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 transition-all
                   peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                   peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
      >
        {t.toUpperCase()}
      </label>
    </div>
  ))}
</div>

{/* ─── Feature-flags ─────────────────────────────── */}
<div className="flex items-center gap-6">
    <ul>
       
       <h2 className="mb-2 text-sm font-medium text-gray-900">Features:</h2>
 <li>
  <label className="flex items-center gap-2 text-sm text-gray-700">
    <input
      type="checkbox"
      name="hasColor"
      checked={form.hasColor}
      onChange={handleChange}
      className="h-4 w-4 rounded-sm border border-gray-400 accent-black"
    />
    Custom&nbsp;color
  </label>
  </li>
<li>
    <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
        type="checkbox"
        name="hasEngraving"
        checked={form.hasEngraving}
        onChange={handleChange}
        className="h-4 w-4 rounded-sm border border-gray-400 accent-black"
        />
        Custom&nbsp;engraving
    </label>
  </li>
  <li>
    <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
        type="checkbox"
        name="hasFont"
        checked={form.hasFont}
        onChange={handleChange}
        className="h-4 w-4 rounded-sm border border-gray-400 accent-black"
        />
        Custom&nbsp;font
    </label>
  </li>
  </ul>


</div>


    {/* Thumbnail upload */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-500">Thumbnail</label>

      {imagePreview && (
        <img
          src={imagePreview}
          alt="preview"
          className="h-32 w-32 rounded object-cover"
        />
      )}

      {/* hidden native input */}
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setImageFile(f);
            setPreview(URL.createObjectURL(f));
          }
        }}
      />

      {/* visible button */}
      <label
        htmlFor="file-input"
        className="inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed
                   border-gray-400 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700
                   transition hover:border-gray-500 hover:bg-gray-50"
      >
        {uploading ? 'Uploading…' : 'Choose image'}
      </label>
    </div>

    {/* Error */}
    {error && <p className="text-sm text-red-600">{error}</p>}

    {/* Submit */}
    <button
      type="submit"
      disabled={saving}
      className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white
                 transition hover:bg-indigo-700 disabled:opacity-40"
    >
      {saving ? 'Saving…' : 'Submit Product'}
    </button>
  </form>
</div>
</div>



  );
     
};


export default UploadProduct;