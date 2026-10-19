import React from 'react';

import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useSearch } from 'utils/router';

import { findMatch } from './findMatch';

const Mark = styled.mark`
  background: ${colors.teal50};
  color: inherit;
  border-radius: ${stylingConsts.borderRadius};
`;

interface Props {
  text: string;
}

// A title with the search marked in it, where it appears as typed. The search
// itself matches more loosely, so a result can show no mark.
const SearchHighlight = ({ text }: Props) => {
  const { search } = useSearch({ from: '/$locale/admin/projects/' });
  const term = search?.trim();
  const match = term ? findMatch(text, term) : undefined;

  if (!match) return <>{text}</>;

  const { start, end } = match;

  return (
    <>
      {text.slice(0, start)}
      <Mark>{text.slice(start, end)}</Mark>
      {text.slice(end)}
    </>
  );
};

export default SearchHighlight;
