"use server";

import {prisma} from "@/db/prisma";
import {convertToRegularJsObject, formatError} from "../utils";
import {LATEST_PRODUCTS_LIMIT, PAGE_SIZE} from "../constants";
import {revalidatePath} from "next/cache";
import {productSchema, updateProductSchema} from "../validators";
import {z} from "zod";
import {Prisma} from "@prisma/client";

//get all products limited
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });

  return convertToRegularJsObject(data);
}

//get single product by slug
export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findFirst({
    //retornando slug que pode ser a mesma coisa que retornar o id, só mudar se quiser
    where: {
      slug,
    },
  });

  return data;
}

//get product by id
export async function getProductById(id: string) {
  const data = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  return convertToRegularJsObject(data);
}

//get all products
type GetAllProductsParams = {
  query: string;
  limit?: number;
  page: number;
  category?: string;
};

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: GetAllProductsParams) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
    },
    take: limit,
    skip: (page - 1) * limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//create product
export async function createProduct(data: z.infer<typeof productSchema>) {
  try {
    const product = productSchema.parse(data);
    await prisma.product.create({data: product});

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findUnique({
      where: {id: product.id},
    });

    if (!productExists) throw new Error("Product not found");

    await prisma.product.update({
      where: {id: product.id},
      data: product,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return {success: false, message: formatError(error)};
  }
}

//delete product
export async function deleteProduct(id: string) {
  try {
    const productExist = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!productExist) throw new Error("Product not found");

    await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
