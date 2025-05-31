import { useState } from 'react'
import ProductCard from './components/ProductCard';


function App() {
  const [count, setCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('');
  

  //dummy data
  const dummyProducts = [
  {
    title: 'Super Mario',
    image: 'https://i.etsystatic.com/35185215/r/il/ed8f68/6570779080/il_1588xN.6570779080_7ck2.jpg',
    price: 68,
  },
  {
    title: 'Dead Pool',
    image: 'https://i.etsystatic.com/35185215/r/il/5b3f23/6570738782/il_1588xN.6570738782_rzjo.jpg',
    price: 16.5,
    oldPrice: 48,
  },
  {
    title: 'Hello Kitty',
    image: 'https://i.etsystatic.com/35185215/c/1679/1679/290/1077/il/31fbcf/6290684146/il_600x600.6290684146_2qq0.jpg',
    price: 20,
    oldPrice: 25,
  },
  {
    title: 'Stitch',
    image: 'https://i.etsystatic.com/35185215/r/il/e1dbb4/5379852857/il_1588xN.5379852857_no5r.jpg',
    price: 38,
    oldPrice: 48,
  },
    {
    title: 'Unicorn',
    image: 'https://i.etsystatic.com/35185215/c/2250/1784/0/827/il/c71d8f/5379979751/il_600x600.5379979751_t46h.jpg',
    price: 38,
    oldPrice: 48,
  },
    {
    title: 'Personalizeable Apron',
    image: 'https://i.etsystatic.com/35185215/r/il/088d51/5755881062/il_1588xN.5755881062_b6po.jpg',
    price: 38,
    oldPrice: 48,
  },
    {
    title: 'Stainless tumbler',
    image: 'https://i.etsystatic.com/35185215/r/il/408dcf/5682651676/il_1588xN.5682651676_ohjr.jpg',
    price: 38,
    oldPrice: 48,
  },
    {
    title: 'Spiderman',
    image: 'https://i.etsystatic.com/35185215/r/il/793e5f/6338858023/il_1588xN.6338858023_lwq6.jpg',
    price: 38,
    oldPrice: 48,
  },
];

  const filteredProducts = dummyProducts.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-white">
                {/*NAVBAR*/}
                <div className="navbar bg-[#f9f9fb] text-gray-800">
              <div className="flex-1">
                <a className="btn btn-ghost text-xl">Kyer's Handmades</a>
              </div>
              <div className="form-control">
                <div className="input input-bordered flex items-center gap-2 bg-white text-gray-800">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input type="text" placeholder="Search" className="grow bg-transparent outline-none placeholder-gray-400"
                          value ={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
 
                          />
                </div>
            </div>

              
            
              <div className="flex-none">
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <div className="indicator">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> </svg>
                      <span className="badge badge-sm indicator-item">8</span>
                    </div>
                  </div>
                  <div
                    tabIndex={0}
                    className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow">
                    <div className="card-body">
                      <span className="text-lg font-bold">8 Items</span>
                      <span className="text-info">Subtotal: $999</span>
                      <div className="card-actions">
                        <button className="btn btn-primary btn-block">View cart</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS Navbar component"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    <li>
                      <a className="justify-between">
                        Profile
                        <span className="badge">New</span>
                      </a>
                    </li>
                    <li><a>Settings</a></li>
                    <li><a>Logout</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/*Product Cards*/}
            <div>
              {filteredProducts.map((product, idx) => (
                <ProductCard key={idx}{...product}/>
              ))}
            </div>







    </div>
    
    
    </>
  )
}

export default App
