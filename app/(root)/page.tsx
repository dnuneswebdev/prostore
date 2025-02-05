import ProductList from "@/components/shared/products/product-list";
import {getLatestProducts} from "@/lib/actions/product.actions";

export default async function Home() {
  const latestProducts = await getLatestProducts();

  return (
    <>
      <ProductList data={latestProducts} title="Newest Arrival" limit={4} />
    </>
  );
}
