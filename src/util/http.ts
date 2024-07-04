export class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function fetchApi(url: string, options?: RequestInit, stream: boolean = false) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new HttpError(response.statusText, response.status);
  }
  return stream ? response.body : response.json() as Record<string, any>;
}
