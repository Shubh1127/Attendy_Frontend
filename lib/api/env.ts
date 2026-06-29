function readEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}`
    );
  }

  return value;
}

export const env = {
  apiBaseUrl: readEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:8000"
  ),
};