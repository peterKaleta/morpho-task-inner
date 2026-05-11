import { GraphQLError } from "graphql";

import { isApplicationError } from "@/server/errors";

export function toGraphqlError(error: unknown): GraphQLError {
  if (isApplicationError(error)) {
    const extensions: Record<string, unknown> = {
      code: error.code,
      status: error.status,
    };

    if (error.details) {
      extensions.details = error.details;
    }

    return new GraphQLError(error.message, {
      extensions: {
        ...extensions,
      },
      originalError: error,
    });
  }

  if (error instanceof GraphQLError) {
    return error;
  }

  return new GraphQLError("Something went wrong.", {
    extensions: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
