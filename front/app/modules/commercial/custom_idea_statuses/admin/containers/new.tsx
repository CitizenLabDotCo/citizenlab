import React from 'react';

import styled from 'styled-components';

import useAddIdeaStatus from 'api/idea_statuses/useAddIdeaStatus';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import IdeaStatusForm, { FormValues } from '../components/IdeaStatusForm';

import messages from './messages';

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const NewIdeaStatus = () => {
  const { mutate: addIdeaStatus } = useAddIdeaStatus();
  const tenantLocales = useAppConfigurationLocales();
  const handleSubmit = (values: FormValues) => {
    addIdeaStatus(values, { onSuccess: goBack });
  };

  const goBack = () => {
    clHistory.push('/admin/settings/statuses');
  };

  if (!isNilOrError(tenantLocales)) {
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
        />
      </Section>
    );
  }

  return null;
};

export default NewIdeaStatus;
