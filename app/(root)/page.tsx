import ProductCarousel from "@/components/shared/products/product-carousel";
import ProductList from "@/components/shared/products/product-list";
import {Button} from "@/components/ui/button";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import Link from "next/link";

export default async function Home() {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title="Newest Arrival" limit={4} />
      <div className="flex justify-center items-center my-7">
        <Button asChild>
          <Link href="/search?q=all">View All Products</Link>
        </Button>
      </div>
    </>
  );
}
