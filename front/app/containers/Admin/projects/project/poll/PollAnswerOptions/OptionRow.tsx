import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { Row, TextCell } from 'components/admin/ResourceList';
import T from 'components/T';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const StyledButton = styled(Button)`
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
}) => (
  <Row key={pollOptionId}>
    <TextCell className="expand">
      <Box display="flex" alignItems="center">
        <T value={pollOptionTitle} />
      </Box>
    </TextCell>
    <Button
      className="e2e-delete-option"
      onClick={deleteOption}
      buttonStyle="text"
      icon="delete"
    >
      <FormattedMessage {...messages.deleteOption} />
    </Button>
    <StyledButton
      className="e2e-edit-option"
      onClick={editOption}
      buttonStyle="secondary"
      icon="edit"
    >
      <FormattedMessage {...messages.editOption} />
    </StyledButton>
  </Row>
);

export default OptionRow;
