import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';

import { Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

interface Props {
  initiativeStatus: IInitiativeStatusData;
}

const RequiresChanges = ({ initiativeStatus }: Props) => {
  return (
    <Container>
      <StatusWrapper>
        <T value={initiativeStatus.attributes.title_multiloc} />
      </StatusWrapper>
      <StatusIcon ariaHidden name="halt" fill={colors.red600} />
      <StatusExplanation>
        <b>
          <FormattedMessage
            {...messages.requiresChangesStatusExplanationBold}
          />
        </b>{' '}
        <FormattedMessage
          {...messages.requiresChangesStatusExplanationSentenceTwo}
        />
      </StatusExplanation>
    </Container>
  );
};

export default RequiresChanges;
