import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useDrop } from 'react-dnd';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import PageTitle from 'components/CustomFieldsForm/Page/PageTitle';

import { useIntl } from 'utils/cl-intl';

import { DND_QUESTION, DragItem, useBuilder } from '../context';
import messages from '../messages';
import { isFormEndPage } from '../utils';

import BlockToolbar, { getBlockOutline } from './BlockToolbar';

type Props = {
  page: IFlatCustomField;
};

// The page title and description, as participants see them. Clicking opens the
// page settings.
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
  const isEmpty =
    localize(page.title_multiloc) === '' &&
    localize(page.description_multiloc) === '';

  // Like for participants, a page without title or description has no
  // header. Its settings open from the page list.
  if (isEmpty) return null;

  return (
    <Box
      ref={drop}
      position="relative"
      borderRadius="3px"
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
      <PageTitle page={page} />
    </Box>
  );
};

export default PageHeaderBlock;
