export async function GET() {
  return Response.json(
    { error: "Current user lookup is not implemented yet." },
    { status: 501 },
  );
}
