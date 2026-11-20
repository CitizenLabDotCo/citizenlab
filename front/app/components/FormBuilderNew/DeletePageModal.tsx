import React from 'react';

import {
  Box,
  Button,
  CardButton,
  Text,
} from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { DeletePageMode, getMergeTargetPage, getPageGroups } from './utils';

type Props = {
  fields: IFlatCustomField[];
  pageId: string;
  onClose: () => void;
  onDelete: (mode: DeletePageMode) => void;
};

// Asks what happens to the questions of a page that's being deleted.
const DeletePageModal = ({ fields, pageId, onClose, onDelete }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const groups = getPageGroups(fields);
  const group = groups.find((group) => group.page.id === pageId);
  const target = getMergeTargetPage(fields, pageId);
  if (!group || !target) return null;

  const pageLabel = (page: IFlatCustomField) => {
    const number = groups.findIndex((g) => g.page.id === page.id) + 1;
    const pageNumber = formatMessage(messages.pageNumber, { number });
    const title = localize(page.title_multiloc);
    return title ? `${pageNumber} ("${title}")` : pageNumber;
  };
  const count = group.questions.filter(
    ({ field }) => field.enabled !== false
  ).length;

  return (
    <Modal
      opened
      close={onClose}
      width="560px"
      header={formatMessage(messages.deletePageTitle, {
        pageLabel: pageLabel(group.page),
      })}
    >
      <Box p="24px" pt="8px" display="flex" flexDirection="column" gap="12px">
        <Text m="0px" mb="4px">
          {formatMessage(messages.deletePageIntro, { count })}
        </Text>
        <CardButton
          iconName="page"
          title={formatMessage(messages.deletePageOnly)}
          subtitle={formatMessage(messages.deletePageOnlyDescription, {
            count,
            pageLabel: pageLabel(target),
          })}
          width="100%"
          minHeight="0px"
          onClick={(event) => {
            event.preventDefault();
            onDelete('keepQuestions');
          }}
          data-cy="e2e-delete-page-only"
        />
        <CardButton
          iconName="delete"
          title={formatMessage(messages.deletePageAndQuestions)}
          subtitle={formatMessage(messages.deletePageAndQuestionsDescription, {
            count,
          })}
          width="100%"
          minHeight="0px"
          onClick={(event) => {
            event.preventDefault();
            onDelete('deleteQuestions');
          }}
          data-cy="e2e-delete-page-and-questions"
        />
        <Box display="flex" justifyContent="flex-end" mt="4px">
          <Button type="button" buttonStyle="text" onClick={onClose}>
            {formatMessage(messages.cancel)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeletePageModal;
