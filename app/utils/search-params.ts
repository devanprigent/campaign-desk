export type Query = Record<string, string>;

export function toQuery(url: string): Query {
  return Object.fromEntries(new URL(url).searchParams);
}

export function pageHref(query: Query, page: number): string {
  const params = new URLSearchParams(query);
  if (page === 0) params.delete("page");
  else params.set("page", String(page));
  return `?${params}`;
}

export function nonEmptyParams(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  for (const [name, value] of new FormData(form)) {
    if (typeof value === "string" && value !== "") params.set(name, value);
  }
  return params;
}
