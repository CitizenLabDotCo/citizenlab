import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import PageTitle from 'components/CustomFieldsForm/Page/PageTitle';

import { useIntl } from 'utils/cl-intl';

import { DND_QUESTION, DragItem, useBuilder } from '../context';
import messages from '../messages';
import { isFormEndPage } from '../utils';

import BlockToolbar, { getBlockOutline } from './BlockToolbar';
import { EmptyBlockHint } from './QuestionBlock';

// The page title and description (and the hint) bring their own bottom
// margins; the last one's is moved outside the outlined block, so the outline
// wraps only the content and doesn't reach into the first question.
const Content = styled.div`
  & > :last-child {
    margin-bottom: 0;
  }
`;

type Props = {
  page: IFlatCustomField;
};

// The page title and description, as participants see them, with a hint on
// top when either is missing. Clicking opens the page settings.
const PageHeaderBlock = ({ page }: Props) => {
  const [hovered, setHovered] = useState(false);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const {
    selectedFieldId,
    selectField,
    erroredFieldIds,
    setDropTarget,
    deleteField,
    getPageBlocker,
  } = useBuilder();

  const [, drop] = useDrop<DragItem>({
    accept: DND_QUESTION,
    canDrop: () => !isFormEndPage(page),
    hover: () => {
      if (!isFormEndPage(page)) setDropTarget({ pageId: page.id, index: 0 });
    },
  });

  const selected = selectedFieldId === page.id;
  const hasError = erroredFieldIds.has(page.id);
  const hasTitle = localize(page.title_multiloc) !== '';
  const hasDescription = localize(page.description_multiloc) !== '';
  const missingMessage =
    !hasTitle && !hasDescription
      ? messages.pageMissingTitleAndDescription
      : !hasTitle
      ? messages.pageMissingTitle
      : !hasDescription
      ? messages.pageMissingDescription
      : null;
  const missingHint = missingMessage && (
    <EmptyBlockHint>
      <Text color="textSecondary" m="0px">
        {formatMessage(missingMessage)}
      </Text>
    </EmptyBlockHint>
  );

  // Same as the margin removed from the last element: the description's, or
  // the hint's when it comes last.
  const bottomSpacing = hasDescription ? '48px' : '24px';

  return (
    <Box
      ref={drop}
      position="relative"
      borderRadius="3px"
      mb={bottomSpacing}
      style={{
        outline: getBlockOutline({ selected, hasError, hovered }),
        outlineOffset: '8px',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectField(page.id)}
      data-cy="e2e-form-builder-new-page-header"
    >
      {(hovered || selected) && !getPageBlocker('delete', page.id) && (
        <BlockToolbar
          actions={[
            {
              icon: 'delete',
              label: formatMessage(messages.delete),
              onClick: () => deleteField(page.id),
            },
          ]}
        />
      )}
      {/* The hint sits where the missing part would go: below the title when
          only the description is missing, otherwise at the top. */}
      <Content>
        {hasTitle ? (
          <>
            <PageTitle page={page} />
            {missingHint}
          </>
        ) : (
          <>
            {missingHint}
            <PageTitle page={page} />
          </>
        )}
      </Content>
    </Box>
  );
};

export default PageHeaderBlock;
