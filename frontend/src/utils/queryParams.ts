export function queryParams(
  filters: Record<string, string | number | boolean | Array<string | number | boolean> | null | undefined>
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((item) => params.append(k, String(item)));
    } else if (v !== undefined && v !== null) {
      params.set(k, String(v));
    }
  });

  return params;
}
