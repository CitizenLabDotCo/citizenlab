import React from 'react';

// Small layout pieces for the Foundations pages. These pages document the
// tokens, so they render plain elements rather than the components under test.

export const Page = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    style={{
      fontFamily: 'Public Sans, sans-serif',
      color: '#1E1E1E',
      padding: 32,
      maxWidth: 960,
      width: '100%',
      alignSelf: 'flex-start',
      boxSizing: 'border-box',
    }}
  >
    <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px' }}>
      {title}
    </h1>
    {intro && (
      <div style={{ fontSize: 14, color: '#596B7A', marginBottom: 24 }}>
        {intro}
      </div>
    )}
    {children}
  </div>
);

export const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>
      {title}
    </h2>
    {note && (
      <div style={{ fontSize: 13, color: '#596B7A', marginBottom: 12 }}>
        {note}
      </div>
    )}
    {children}
  </section>
);

export const Code = ({ children }: { children: React.ReactNode }) => (
  <code
    style={{
      fontFamily: 'ui-monospace, Menlo, monospace',
      fontSize: 12,
      background: '#F4F6F8',
      padding: '1px 4px',
      borderRadius: 4,
    }}
  >
    {children}
  </code>
);
