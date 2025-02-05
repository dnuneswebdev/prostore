import {Product} from "@/@types/types";
import ProductCard from "./product-card";

type ProductListProps = {
  data: Product[];
  title?: string;
  limit?: number;
};

const ProductList = ({data, title, limit}: ProductListProps) => {
  const limitedData = limit ? data.slice(0, limit) : data;

  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>

      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {limitedData.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {data.length === 0 && (
        <div>
          <p className="text-center">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
