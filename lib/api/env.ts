function readEnv(key: string, fallback?: string): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL ?? fallback;

  // console.log("API Base URL in web:", value);
  // console.log("RAW ENV:", process.env.NEXT_PUBLIC_API_BASE_URL);
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