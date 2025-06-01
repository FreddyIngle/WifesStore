import { signInWithGoogle } from './auth';
import App from '../App';

const ProductCard = ({ image, title, price, oldPrice, tag, tag2,handleProtectedClick }) => {
    return(
        <div class="card w-full max-w-[400px] aspect-[3/4] bg-white shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
            <figure className="h-[90%] w-full">
                <img
                src={image}
                alt={title} />
            </figure>
            <div class="card-body  p-4 text-sm flex flex-col justify-between">
                <h2 class="card-title text-black font-semibold text-sm mb-1">
                {title}
                <div class="badge badge-secondary">NEW</div>
                <p className="text-xs font-semibold text-black">
                    ${price}
                </p>
                </h2>

                <div className="card-actions">
                    <button onClick={handleProtectedClick} className="btn btn-sm bg-gray text-white hover:bg-blue-600 ">Add to Cart</button>
                </div>
                <div class="card-actions justify-end text-xs text-gray-500 border-gray-300">
                    <div class="badge badge-outline">{tag}</div>
                    <div class="badge badge-outline">{tag2}</div>
                    
                </div>
            </div>
        </div>
    )


};

export default ProductCard;