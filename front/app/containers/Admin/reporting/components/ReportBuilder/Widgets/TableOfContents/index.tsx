import React, { useEffect, useState } from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';

// The class the paginator looks for when it writes the page numbers in.
export const TOC_PAGE_CLASS = 'e2e-toc-page';
export const TOC_ROW_CLASS = 'e2e-toc-row';

const Panel = styled(Box)`
  break-inside: avoid;
`;

const Row = styled(Box)`
  display: flex;
  align-items: baseline;
  gap: 10px;
  break-inside: avoid;

  // The leader dots between the title and the page number.
  &::after {
    content: '';
    flex: 1;
    order: 1;
    border-bottom: 1px dotted ${colors.borderDark};
    margin-bottom: 5px;
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

export interface Props {
  // The heading above the list. Falls back to the platform's own word for it,
  // so a report that never sets one still reads correctly in every locale.
  title?: Multiloc;
}

const TableOfContents = ({ title }: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [entries, setEntries] = useState<Entry[]>([]);
  const accent = theme.colors.tenantPrimary;

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
      {/* The same rule the cover opens with, so the contents reads as the second
          page of one document rather than a list that wandered in. */}
      <Box w="100%" h="4px" background={accent} mb="24px" />

      <Title variant="h2" m="0 0 24px">
        {localize(title) || formatMessage(messages.contents)}
      </Title>

      {entries.length === 0 && (
        <Text m="0" fontSize="base" color="textSecondary">
          <FormattedMessage {...messages.empty} />
        </Text>
      )}

      {entries.map((entry) => {
        // Sections carry the weight; anything nested under them steps back and in,
        // so the shape of the report is readable at a glance.
        const isSection = entry.level <= 2;

        return (
          <Row
            key={entry.id}
            className={TOC_ROW_CLASS}
            data-toc-ref={entry.id}
            mb={isSection ? '14px' : '10px'}
            pl={isSection ? '0' : '20px'}
          >
            <Text
              m="0"
              fontSize={isSection ? 'l' : 'base'}
              color={isSection ? 'textPrimary' : 'textSecondary'}
              fontWeight={isSection ? 'semi-bold' : 'normal'}
            >
              {entry.text}
            </Text>
            <Text
              m="0"
              fontSize={isSection ? 'l' : 'base'}
              color={isSection ? 'textPrimary' : 'textSecondary'}
              fontWeight={isSection ? 'semi-bold' : 'normal'}
              className={TOC_PAGE_CLASS}
              style={{ order: 2 }}
            />
          </Row>
        );
      })}
    </Panel>
  );
};

TableOfContents.craft = {
  props: {
    title: {},
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.contents,
  },
};

export const tableOfContentsTitle = messages.contents;

export default TableOfContents;
