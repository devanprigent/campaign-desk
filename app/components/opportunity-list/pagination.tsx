import { Link } from "react-router";

import { pageHref, type Query } from "../../utils/search-params";

type Props = { query: Query; page: number; hasNextPage: boolean };

export function Pagination({ query, page, hasNextPage }: Props) {
  return (
    <nav aria-label="Pagination">
      {page > 0 ? <Link to={pageHref(query, page - 1)}>← Previous</Link> : <span>← Previous</span>}
      {" · "}Page {page + 1}{" · "}
      {hasNextPage ? <Link to={pageHref(query, page + 1)}>Next →</Link> : <span>Next →</span>}
    </nav>
  );
}
