// A source line. Every number on a slide needs one of these on the same
// scene. Keep it short: author or collaboration, venue or arXiv id, year,
// and the table or figure the number comes from.
export function Source({ children, href }: { children: React.ReactNode; href?: string }) {
  const body = <span className="t-source">source · {children}</span>;
  if (!href) return body;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="underline decoration-dotted underline-offset-4">
      {body}
    </a>
  );
}
