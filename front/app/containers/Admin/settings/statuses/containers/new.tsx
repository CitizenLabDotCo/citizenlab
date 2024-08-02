import React from 'react';

import styled from 'styled-components';

import useAddIdeaStatus from 'api/idea_statuses/useAddIdeaStatus';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import IdeaStatusForm, { FormValues } from '../components/IdeaStatusForm';

import messages from './messages';

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const NewIdeaStatus = ({ variant }: { variant: 'ideation' | 'proposals' }) => {
  const { data: ideaStatuses } = useIdeaStatuses({
    participation_method: variant,
  });
  const { mutate: addIdeaStatus } = useAddIdeaStatus();
  const tenantLocales = useAppConfigurationLocales();
  const handleSubmit = (values: FormValues) => {
    addIdeaStatus(
      { ...values, participation_method: variant },
      { onSuccess: goBack }
    );
  };

  const goBack = () => {
    clHistory.push(`/admin/settings/${variant}/statuses`);
  };

  if (tenantLocales && ideaStatuses) {
    return (
      <Section>
        <GoBackButton onClick={goBack} />
        <StyledSectionTitle>
          <FormattedMessage {...messages.addIdeaStatus} />
        </StyledSectionTitle>
        <IdeaStatusForm
          defaultValues={{
            color: '#b5b5b5',
            code: 'proposed',
          }}
          onSubmit={handleSubmit}
          ideaStatuses={ideaStatuses}
          showCategorySelector
        />
      </Section>
    );
  }

  return null;
};

export default NewIdeaStatus;
