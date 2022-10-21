import React from 'react';
import styled from 'styled-components';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { Section, SubSectionTitle } from 'components/admin/Section';
import Link from 'utils/cl-router/Link';
import AssigneeSelector from '../components/AssigneeSelector';

const InputAssignmentSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`;

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  projectId: string;
}

const InputAssignment = ({ projectId }: Props) => {
  return (
    <InputAssignmentSection>
      <SubSectionTitle>
        <FormattedMessage {...messages.inputAssignmentSectionTitle} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.inputAssignmentTooltipText}
              values={{
                ideaManagerLink: (
                  <StyledLink to={`/admin/projects/${projectId}/ideas`}>
                    <FormattedMessage {...messages.inputManagerLinkText} />
                  </StyledLink>
                ),
              }}
            />
          }
        />
      </SubSectionTitle>
      <AssigneeSelector projectId={projectId} />
    </InputAssignmentSection>
  );
};

export default InputAssignment;
