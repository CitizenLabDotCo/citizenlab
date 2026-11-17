import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { Row, TextCell } from 'components/admin/ResourceList';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { usePollStyles } from '../PollVariantContext';

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
  const { buttonStyle, boSize } = usePollStyles();

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
        buttonStyle={buttonStyle('text')}
        boSize={boSize}
        icon="delete"
      >
        <FormattedMessage {...messages.deleteOption} />
      </ButtonWithLink>
      <StyledButton
        className="e2e-edit-option"
        onClick={editOption}
        buttonStyle={buttonStyle('secondary-outlined')}
        boSize={boSize}
        icon="edit"
      >
        <FormattedMessage {...messages.editOption} />
      </StyledButton>
    </Row>
  );
};

export default OptionRow;
