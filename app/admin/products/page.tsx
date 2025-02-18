import Link from "next/link";
import {deleteProduct, getAllProducts} from "@/lib/actions/product.actions";
import {formatCurrency, formatId} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";
import {auth} from "@/auth";
import {Edit} from "lucide-react";

type AdminProductsPageProps = {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
};

const AdminProductsPage = async ({searchParams}: AdminProductsPageProps) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchText = params.query || "";
  const category = params.category || "";
  const products = await getAllProducts({
    query: searchText,
    page,
    category,
  });
  const session = await auth();

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Products</h1>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/products/new">Create Product</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>RATING</TableHead>
            <TableHead className="text-right w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              <TableCell className="text-right flex gap-1">
                <Button asChild variant="outline" size="sm" className="p-2">
                  <Link href={`/admin/products/${product.id}`}>
                    <Edit />
                  </Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {products.totalPages > 1 && (
        <Pagination totalPages={products.totalPages} page={page} />
      )}
    </div>
  );
};

export default AdminProductsPage;
