
const ProductCard = ({ image, title, price, oldPrice, tag }) => {
    return(
        <div className="bg-white rounded shadow-md">
      <img src={image} alt={title} className="w-full h-60 object-cover" />
      <div className="p-4">
        <h3 className="text-md font-bold">{title}</h3>
        <div className="mt-2">
          {oldPrice && (
            <span className="line-through text-gray-400 mr-2">${oldPrice}</span>
          )}
          <span className="text-red-500 font-semibold">${price}</span>
        </div>
        {tag && (
          <div className="mt-2 text-xs text-white bg-blue-500 inline-block px-2 py-1 rounded">
            {tag}
          </div>
        )}
      </div>
    </div>
    )


};

export default ProductCard;