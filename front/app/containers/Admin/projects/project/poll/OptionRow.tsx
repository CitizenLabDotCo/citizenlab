import React from 'react';
import styled from 'styled-components';

// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { Row, TextCell } from 'components/admin/ResourceList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc } from 'typings';

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
      <T value={pollOptionTitle} />
      <StyledButton
        className="e2e-edit-option"
        onClick={editOption}
        buttonStyle="text"
        icon="edit"
      />
    </TextCell>
    <Button
      className="e2e-delete-option"
      onClick={deleteOption}
      buttonStyle="text"
      icon="delete"
    >
      <FormattedMessage {...messages.deleteOption} />
    </Button>
  </Row>
);

export default OptionRow;
