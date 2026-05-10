const userRejectionPatterns = [
  /4001/,
  /cancel/i,
  /denied/i,
  /reject/i,
];

const transientWalletPatterns = [
  /already pending/i,
  /connector.*not connected/i,
  /connection request/i,
  /no provider/i,
  /not connected/i,
  /provider.*not found/i,
  /wallet client/i,
];

export function isTransientWalletSigningError(error: unknown) {
  const message = getErrorMessage(error);

  if (!message) {
    return false;
  }

  if (userRejectionPatterns.some((pattern) => pattern.test(message))) {
    return false;
  }

  return transientWalletPatterns.some((pattern) => pattern.test(message));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "";
}
