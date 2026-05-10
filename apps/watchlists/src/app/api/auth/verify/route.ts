export async function POST() {
  return Response.json(
    { error: "Wallet signature verification is not implemented yet." },
    { status: 501 },
  );
}
