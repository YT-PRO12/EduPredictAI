import { API_URL } from "../config";

export async function apiFetch(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const text =
    await response.text();

  let data = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}