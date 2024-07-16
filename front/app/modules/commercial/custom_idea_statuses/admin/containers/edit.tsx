import React from 'react';

import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import useUpdateIdeaStatus from 'api/idea_statuses/useUpdateIdeaStatus';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import IdeaStatusForm, { FormValues } from '../components/IdeaStatusForm';

import messages from './messages';

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 25px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const Edit = () => {
  const { id: statusId } = useParams() as { id: string };
  const { data: ideaStatus } = useIdeaStatus(statusId);
  const { mutate: updateIdeaStatus } = useUpdateIdeaStatus();
  const tenantLocales = useAppConfigurationLocales();

  const handleSubmit = async (values: FormValues) => {
    const { ...params } = values;

    updateIdeaStatus(
      { id: statusId, requestBody: params },
      { onSuccess: goBack }
    );
  };

  const goBack = () => {
    clHistory.push('/admin/settings/statuses');
  };

  if (!isNilOrError(ideaStatus) && !isNilOrError(tenantLocales)) {
    const { color, title_multiloc, description_multiloc, code } =
      ideaStatus.data.attributes;
    return (
      <>
        <StyledGoBackButton onClick={goBack} />
        <Section>
          <StyledSectionTitle>
            <FormattedMessage {...messages.editIdeaStatus} />
          </StyledSectionTitle>
          <IdeaStatusForm
            defaultValues={{
              color,
              title_multiloc,
              description_multiloc,
              code,
            }}
            onSubmit={handleSubmit}
          />
        </Section>
      </>
    );
  }

  return null;
};

export default Edit;
