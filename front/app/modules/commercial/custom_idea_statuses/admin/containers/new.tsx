import React from 'react';
import styled from 'styled-components';
import { addIdeaStatus } from 'services/ideaStatuses';
import clHistory from 'utils/cl-router/history';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

// components
import GoBackButton from 'components/UI/GoBackButton';
import IdeaStatusForm, { FormValues } from '../components/IdeaStatusForm';
import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const NewIdeaStatus = () => {
  const tenantLocales = useAppConfigurationLocales();
  const handleSubmit = async (values: FormValues) => {
    await addIdeaStatus(values);
    goBack();
  };

  const goBack = () => {
    clHistory.push('/admin/ideas/statuses');
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
