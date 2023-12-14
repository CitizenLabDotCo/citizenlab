import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

const PageNavigationButton = styled.button<{ disabled: boolean }>`
  padding-left: 8px;
  padding-right: 8px;
  margin-left: 4px;
  margin-right: 4px;
  cursor: pointer;
  border-radius: 3px;

  &:hover {
    background-color: ${colors.coolGrey300};
  }

  ${({ disabled }) =>
    disabled
      ? `
    cursor: not-allowed;
    color: ${colors.coolGrey300};
    &:hover {
      background-color: ${colors.white};
    }
  `
      : ''}
`;

interface Props {
  currentPageNumber: number;
  numberOfPages: number;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

const PDFPageControl = ({
  currentPageNumber,
  numberOfPages,
  goToPreviousPage,
  goToNextPage,
}: Props) => {
  const { formatMessage } = useIntl();
  const hasPreviousPage = numberOfPages > 1 && currentPageNumber > 1;
  const hasNextPage = numberOfPages > 1 && currentPageNumber < numberOfPages;

  return (
    <Box>
      <PageNavigationButton
        disabled={!hasPreviousPage}
        onClick={goToPreviousPage}
      >
        &lt;
      </PageNavigationButton>
      {formatMessage(messages.page)} {currentPageNumber} / {numberOfPages}
      <PageNavigationButton disabled={!hasNextPage} onClick={goToNextPage}>
        &gt;
      </PageNavigationButton>
    </Box>
  );
};

export default PDFPageControl;
