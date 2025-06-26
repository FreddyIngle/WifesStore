import { signInWithGoogle } from './auth';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import {  useCart } from '../context/CartContext';



const ProductCard = ({ id,image_url, title, price, tag1, tag2, inventory, has_engraving,
    has_font,has_color,signIn }) => {
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [customizations, setCustomizations] = useState([]);
  const [allSame, setAllSame] = useState(false); //to keep all custom input same for each quantity
  const [allSameColor, setAllSameColor] = useState(false); //to keep all custom color same for each quantity
const { addToCart } = useCart();
  
    const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleSelectClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      signInWithGoogle();
      return;
    }

    const initial = Array.from({ length: quantity }, () => ({
      name: '',
      color: '',
    }));
    setCustomizations(initial);
    setShowModal(true);
  };

  return (
    <>
      <div className="card w-full max-w-[400px] aspect-[3/4] bg-white shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
        <figure className="h-[90%] w-full">
          <img src={image_url} alt={title} />
        </figure>
        <div className="card-body p-4 text-sm flex flex-col justify-between">
          <h2 className="card-title text-black font-semibold text-sm mb-1">
            {title}
            <div className="badge badge-secondary">NEW</div>
            <p className="text-xs font-semibold text-black">${price}</p>
          </h2>

          <div className="card-actions">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSelectClick}
                className="btn btn-sm bg-gray text-white hover:bg-blue-600"
              >
                Select
              </button>

              <span className="text-black whitespace-nowrap">
                Stock: <strong>{inventory}</strong>
              </span>

              <span className="text-black whitespace-nowrap">Quantity:</span>

              <select
                className="select select-bordered w-16 h-8"
                value={quantity}
                onChange={handleQuantityChange}
              >
                {Array.from({ length: inventory }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-actions justify-end text-xs text-gray-500 border-gray-300">
            <div className="badge badge-outline">{tag1}</div>
            <div className="badge badge-outline">{tag2}</div>
          </div>
        </div>
      </div>

      {/* Modal */}
{showModal && (
/* ─────────── backdrop ─────────── */
 <div className='fixed inset-0 z-40 bg-black/60'>
  <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 animate-fadeIn">
    <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Customize Your Order</h2>
        <h3 className="text-sm font-medium mb-2"> 1 name/word ONLY please. No special characters. Thank you. ^_^</h3>


        
        
      {customizations.map((item, idx) => (

        <div key={idx} className="mb-4">
          <label className="block font-medium mb-1">Item {idx + 1} Customized Text</label>
          <input
          
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            maxLength={10}
            value={item.name}
            autoFocus={idx === 0} // Autofocus the first item
            onChange={(e) => {
              const updated = [...customizations];
              updated[idx].name = e.target.value;
              setCustomizations(allSame ? updated.map(item => ({ ...updated[0] })) : updated);
              
            }}
          />
         


          <label className="block font-medium mb-1">Backdrop Color</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={item.color}
            onChange={(e) => {
              const updated = [...customizations];
              updated[idx].color = e.target.value;
              // if the toggle is on, copy the NEW colour to every item
                setCustomizations(
                allSame ? updated.map(() => ({ ...updated[0] })) : updated
                );
            }}
          >
            <option value="">Select a color</option>
            <option value="Pink">Pink</option>
            <option value="Blue">Blue</option>
            <option value="Red">Red</option>
          </select>

           {/* --- checkbox appears only for the first row --- */}
    {idx === 0 && (
      <label className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          className="h-4 w-4 accent-green-600"
          checked={allSame}
          onChange={() => setAllSame(!allSame)}
        />
        <span className="text-sm">Apply same details to all items</span>
      </label>
    )}
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded cursor-pointer"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
            className="bg-black hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
            onClick={() => {
                console.log("Customizations:", customizations);
                // 1️⃣  push every single item
                customizations.forEach((custom) => {
                addToCart(
                    id,   
                    title, 
                    1,         // qty == 1 because this loop already runs 'quantity' times
                    custom.name,
                    custom.color,
                    price,
                    image_url,
                    has_engraving,
                    has_font,
                    has_color,
                  
                );
                });

                // 2️⃣  close the modal afterwards
                setShowModal(false);
                console.log("Added to cart:", title, customizations);
            }}
            >
            Add to Cart
    </button>

      </div>
    </div>
  </div>
  </div>

)}
        {/* End Modal */}

      
      
    </>
  );
};

export default ProductCard;
