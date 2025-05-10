
import { Controller, type CreateIngressParams } from "@/lib/controller";

// TODO: validate request with Zod

export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const reqBody = (await req.json()) as CreateIngressParams;
    const response = await controller.createIngress(
      reqBody
    );

    return Response.json(response);
  } catch (err) {
    console.log(err);

    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
