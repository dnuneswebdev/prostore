import {generatePaypalToken, paypal} from "../lib/paypal";

test("generate a token from paypal", async () => {
  const tokenResponse = await generatePaypalToken();

  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});

test("create paypal order", async () => {
  const tokenResponse = await generatePaypalToken();
  const price = 100.0;
  const orderResponse = await paypal.createOrder(price);

  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

test("capture payment", async () => {
  const orderId = "1000";
  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({status: "COMPLETED"});
  const captureResponse = await paypal.capturePayment(orderId);

  expect(captureResponse).toHaveProperty("status");
  expect(captureResponse.status).toBe("COMPLETED");

  mockCapturePayment.mockRestore();
});
