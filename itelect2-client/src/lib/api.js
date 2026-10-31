export async function apiRequest(baseUrl, path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  let response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Could not reach the API. Check the service URL and try again.");
  }

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = Array.isArray(responseBody?.error)
      ? responseBody.error.join(", ")
      : responseBody?.error;
    throw new Error(detail || `Request failed (${response.status}).`);
  }
  return responseBody;
}
