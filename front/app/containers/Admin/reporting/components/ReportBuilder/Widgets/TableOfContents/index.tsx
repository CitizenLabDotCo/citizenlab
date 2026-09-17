import React, { useEffect, useState } from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// The class the paginator looks for when it writes the page numbers in.
export const TOC_PAGE_CLASS = 'e2e-toc-page';
export const TOC_ROW_CLASS = 'e2e-toc-row';

const Panel = styled(Box)`
  break-inside: avoid;
`;

const Row = styled(Box)`
  display: flex;
  align-items: baseline;
  gap: 8px;
  break-inside: avoid;

  // The leader dots between the title and the page number.
  &::after {
    content: '';
    flex: 1;
    order: 1;
    border-bottom: 1px dotted ${colors.borderDark};
    margin-bottom: 4px;
  }
`;

interface Entry {
  id: string;
  text: string;
  level: number;
}

// Reads the headings out of the rendered report. Doing it from the DOM rather
// than from the layout means the list matches what a reader will actually see,
// including anything an admin typed by hand.
const readHeadings = (root: ParentNode): Entry[] =>
  [...root.querySelectorAll<HTMLElement>('h1, h2, h3')]
    // The cover's title is the report's name, not a section of it, and the
    // contents list must not list itself either.
    .filter(
      (heading) =>
        !heading.closest('.e2e-table-of-contents') &&
        !heading.closest('.e2e-report-cover')
    )
    .map((heading, index) => {
      const id = heading.id || `report-section-${index}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent.trim(),
        level: Number(heading.tagName.slice(1)),
      };
    })
    .filter((entry) => entry.text !== '');

const TableOfContents = () => {
  const [entries, setEntries] = useState<Entry[]>([]);

  // One pass after the report has rendered. The entries must exist before the
  // paginator runs, so that filling in the page numbers cannot change the
  // layout that produced them.
  useEffect(() => {
    const frame = document.querySelector('#e2e-content-builder-frame');
    if (!frame) return;

    const read = () => setEntries(readHeadings(frame));
    read();

    const observer = new MutationObserver(read);
    observer.observe(frame, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <Panel className="e2e-table-of-contents" mb="8px">
      <Title variant="h3" m="0 0 12px">
        <FormattedMessage {...messages.contents} />
      </Title>

      {entries.length === 0 && (
        <Text m="0" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.empty} />
        </Text>
      )}

      {entries.map((entry) => (
        <Row
          key={entry.id}
          className={TOC_ROW_CLASS}
          data-toc-ref={entry.id}
          mb="6px"
          pl={entry.level >= 3 ? '16px' : '0'}
        >
          <Text m="0" fontSize="s" color="textPrimary">
            {entry.text}
          </Text>
          <Text
            m="0"
            fontSize="s"
            color="textSecondary"
            className={TOC_PAGE_CLASS}
            style={{ order: 2 }}
          />
        </Row>
      ))}
    </Panel>
  );
};

TableOfContents.craft = {
  props: {},
  custom: {
    title: messages.contents,
  },
};

export const tableOfContentsTitle = messages.contents;

export default TableOfContents;
