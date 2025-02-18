"use client";

import {useToast} from "@/hooks/use-toast";
import {productSchema, updateProductSchema} from "@/lib/validators";
import {Product} from "@/@types/types";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {ControllerRenderProps, SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import slugify from "slugify";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {createProduct, updateProduct} from "@/lib/actions/product.actions";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import {Checkbox} from "@/components/ui/checkbox";
import {UploadButton} from "@/lib/uploadthing";
import {productDefaultValues} from "@/lib/constants";

type ProductFormProps = {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
};

const ProductForm = ({type, product, productId}: ProductFormProps) => {
  const router = useRouter();
  const {toast} = useToast();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver:
      type === "Update"
        ? zodResolver(updateProductSchema)
        : zodResolver(productSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const onSubmitProductForm: SubmitHandler<
    z.infer<typeof productSchema>
  > = async (formValues) => {
    if (type === "Create") {
      const response = await createProduct(formValues);

      if (!response.success) {
        toast({description: response.message, variant: "destructive"});
      } else {
        toast({description: response.message});
        router.push("/admin/products");
      }
    }

    if (type === "Update") {
      if (!productId) return router.push("/admin/products");

      const response = await updateProduct({...formValues, id: productId});

      if (!response.success) {
        toast({description: response.message, variant: "destructive"});
      } else {
        toast({description: response.message});
        router.push("/admin/products");
      }
    }
  };

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        method="POST"
        onSubmit={form.handleSubmit(onSubmitProductForm)}
      >
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      type="button"
                      size="sm"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), {lower: true})
                        );
                      }}
                    >
                      Generate slug
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="category"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter product price"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stock" {...field} type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="upload-field flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 h-min-48">
                    <div className="flex-start space-x-2">
                      {images?.map((image: string) => (
                        <Image
                          key={image}
                          src={image}
                          alt="Product Image"
                          className="w-20 h-20 object-cover object-center rounded-sm"
                          width={100}
                          height={100}
                        />
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(
                            response: {url: string}[]
                          ) => {
                            form.setValue("images", [
                              ...images,
                              response[0].url,
                            ]);
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              description: `Error! ${error.message}`,
                              variant: "destructive",
                            });
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="upload-field">
          Featured Product
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({field}) => (
                  <FormItem className="space-x-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Is Featured?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="Product Banner"
                  width={1920}
                  height={680}
                  className="object-cover object-center rounded-sm"
                />
              )}

              {isFeatured && !banner && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(response: {url: string}[]) => {
                    form.setValue("banner", response[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      description: `Error! ${error.message}`,
                      variant: "destructive",
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <FormField
            control={form.control}
            name="description"
            render={({field}) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    {...field}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button
            type="submit"
            className="w-full button col-span-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
