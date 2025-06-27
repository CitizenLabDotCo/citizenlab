import React from 'react';

import styled from 'styled-components';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
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

const NewIdeaStatus = ({
  variant,
}: {
  variant: IdeaStatusParticipationMethod;
}) => {
  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: { participation_method: variant },
  });
  const { mutateAsync: addIdeaStatus } = useAddIdeaStatus();
  const tenantLocales = useAppConfigurationLocales();
  const handleSubmit = async (values: FormValues) => {
    await addIdeaStatus({ ...values, participation_method: variant });
    goBack();
  };

  const goBack = () => {
    clHistory.push(`/admin/settings/statuses/${variant}`);
  };

  if (tenantLocales && ideaStatuses) {
    return (
      <div data-testid="e2e-new-status-page">
        <GoBackButton onClick={goBack} />
        <Section>
          <StyledSectionTitle>
            <FormattedMessage {...messages.addIdeaStatus} />
          </StyledSectionTitle>
          <IdeaStatusForm
            defaultValues={{
              color: '#b5b5b5',
              code: 'custom',
            }}
            onSubmit={handleSubmit}
            showCategorySelector
            variant={variant}
          />
        </Section>
      </div>
    );
  }

  return null;
};

export default NewIdeaStatus;
