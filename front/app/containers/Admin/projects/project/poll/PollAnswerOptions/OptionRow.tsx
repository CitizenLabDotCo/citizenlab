import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import Button from 'design-system/Button';

import { Row, TextCell } from 'components/admin/ResourceList';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { useIsPanelPoll } from '../PollVariantContext';

import styles from './PollAnswerOptions.module.css';

const StyledButton = styled(ButtonWithLink)`
  display: inline-block;
`;

const OptionRow = ({
  pollOptionId,
  pollOptionTitle,
  deleteOption,
  editOption,
}: {
  pollOptionId: string;
  pollOptionTitle: Multiloc;
  deleteOption: () => void;
  editOption: () => void;
}) => {
  const isPanel = useIsPanelPoll();

  if (isPanel) {
    return (
      <Row key={pollOptionId}>
        <TextCell className="expand">
          <span className={styles.optionTitle}>
            <T value={pollOptionTitle} />
          </span>
        </TextCell>
        <Button
          variant="quiet"
          size={28}
          icon="trash-2-16"
          onPress={deleteOption}
        >
          <FormattedMessage {...messages.deleteOption} />
        </Button>
        <Button size={28} icon="pencil-14" onPress={editOption}>
          <FormattedMessage {...messages.editOption} />
        </Button>
      </Row>
    );
  }

  return (
    <Row key={pollOptionId}>
      <TextCell className="expand">
        <Box display="flex" alignItems="center">
          <T value={pollOptionTitle} />
        </Box>
      </TextCell>
      <ButtonWithLink
        className="e2e-delete-option"
        onClick={deleteOption}
        buttonStyle="text"
        icon="delete"
      >
        <FormattedMessage {...messages.deleteOption} />
      </ButtonWithLink>
      <StyledButton
        className="e2e-edit-option"
        onClick={editOption}
        buttonStyle="secondary-outlined"
        icon="edit"
      >
        <FormattedMessage {...messages.editOption} />
      </StyledButton>
    </Row>
  );
};

export default OptionRow;
