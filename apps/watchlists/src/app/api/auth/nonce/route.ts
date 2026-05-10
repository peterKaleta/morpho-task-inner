export async function POST() {
  return Response.json(
    { error: "Nonce creation is not implemented yet." },
    { status: 501 },
  );
}
