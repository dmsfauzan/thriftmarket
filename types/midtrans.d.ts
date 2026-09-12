declare module "midtrans-client" {
  const Midtrans: {
    Snap: new (opts: { isProduction: boolean; serverKey: string; clientKey: string }) => {
      createTransactionToken: (params: unknown) => Promise<string>;
    };
  };
  export default Midtrans;
}
