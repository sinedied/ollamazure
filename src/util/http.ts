export async function fetchApi(url: string, options: RequestInit, stream: boolean = false) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HttpError: ${response.statusText}`);
  }
  return stream ? response.body : response.json() as Record<string, any>;
}
