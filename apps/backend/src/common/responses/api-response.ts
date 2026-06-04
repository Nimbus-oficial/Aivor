export interface ApiResponse<T> {
  ok: true;
  data: T;
  meta: {
    source: "database" | "onchain" | "mock" | "system";
    requestId?: string;
  };
}

export function ok<T>(
  data: T,
  source: ApiResponse<T>["meta"]["source"] = "system"
): ApiResponse<T> {
  return {
    ok: true,
    data,
    meta: { source }
  };
}
