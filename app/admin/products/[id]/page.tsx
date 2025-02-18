import {getProductById} from "@/lib/actions/product.actions";
import {Metadata} from "next";
import {notFound} from "next/navigation";
import ProductForm from "../new/product-form";

export const metadata: Metadata = {
  title: "Update Product",
};

type AdminProductUpdatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const AdminProductUpdatePage = async ({
  params,
}: AdminProductUpdatePageProps) => {
  const {id} = await params;

  const product = await getProductById(id);

  if (!product) return notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product</h1>

      <ProductForm type="Update" product={product} productId={product.id} />
    </div>
  );
};

export default AdminProductUpdatePage;
