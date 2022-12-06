import React from 'react';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import AssigneeSelector from '../components/AssigneeSelector';
import { Section, SubSectionTitle } from 'components/admin/Section';
import styled from 'styled-components';
// i18n
import messages from './messages';

const InputAssignmentSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`;

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
