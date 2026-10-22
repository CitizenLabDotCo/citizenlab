import type { ReactNode } from 'react';

type Props = { title: string; children?: ReactNode };

const Placeholder = ({ title, children }: Props) => (
  <article className="wb-page">
    <h1>{title}</h1>
    <p className="wb-muted">This page is not built yet.</p>
    {children}
  </article>
);

export default Placeholder;
