export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export function toQuerySafeErrorDetail(message: string) {
  return message.slice(0, 180);
}
