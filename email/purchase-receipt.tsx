import {Order, OrderItem} from "@/@types/types";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import {formatCurrency} from "@/lib/utils";
import sampleData from "@/db/sample-data";
require("dotenv").config();

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    userId: "123",
    user: {
      name: "John Doe",
      email: "test@test.com",
    },
    paymentMethod: "Stripe",
    shippingAddress: {
      fullName: "John Doe",
      streetAddress: "123 Main st",
      city: "New York",
      postalCode: "10001",
      country: "US",
    },
    createdAt: new Date(),
    totalPrice: "100",
    taxPrice: "10",
    shippingPrice: "10",
    itemsPrice: "80",
    orderitems: sampleData.products.map((product) => ({
      name: product.name,
      orderId: "123",
      productId: "123",
      slug: product.slug,
      qty: product.stock,
      image: product.images[0],
      price: product.price.toString(),
    })),
    isDelivered: true,
    deliveredAt: new Date(),
    isPaid: true,
    paidAt: new Date(),
    paymentResult: {
      id: "123",
      status: "succeeded",
      pricePaid: "100",
      email_address: "test@test.com",
    },
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
});

type OrderInformationProps = {
  order: Order;
};

export default function PurchaseReceiptEmail({order}: OrderInformationProps) {
  return (
    <Html>
      <Preview>View Order Receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-bold bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    ORDER ID
                  </Text>
                  <Text className="mt-0 mr-4">{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    PURCHASE DATE
                  </Text>
                  <Text className="mt-0 mr-4">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    PRICE PAID
                  </Text>
                  <Text className="mt-0 mr-4">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderitems.map((item: OrderItem) => (
                <Row key={item.productId} className="mt-6">
                  <Column>
                    <Img
                      src={item.image}
                      alt={item.name}
                      className="rounded"
                      width={80}
                    />
                  </Column>

                  <Column className="align-top">
                    {item.name} x {item.qty}
                  </Column>

                  <Column className="align-top" align="right">
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}

              {[
                {name: "Items", price: order.itemsPrice},
                {name: "Tax", price: order.taxPrice},
                {name: "Shipping", price: order.shippingPrice},
                {name: "Total", price: order.totalPrice},
              ].map(({name, price}) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}: </Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
