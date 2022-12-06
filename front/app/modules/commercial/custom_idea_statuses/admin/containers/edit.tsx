import React from 'react';
import { useParams } from 'react-router-dom';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
// hooks
import useIdeaStatus from 'hooks/useIdeaStatus';
import { updateIdeaStatus } from 'services/ideaStatuses';
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import IdeaStatusForm, { FormValues } from '../components/IdeaStatusForm';
import GoBackButton from 'components/UI/GoBackButton';
// components
import { Section, SectionTitle } from 'components/admin/Section';
import styled from 'styled-components';
import messages from './messages';

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 25px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const Edit = () => {
  const { id: statusId } = useParams() as { id: string };
  const ideaStatus = useIdeaStatus({ statusId });
  const tenantLocales = useAppConfigurationLocales();

  const handleSubmit = async (values: FormValues) => {
    const { ...params } = values;

    await updateIdeaStatus(statusId, params);
    goBack();
  };

  const goBack = () => {
    clHistory.push('/admin/ideas/statuses');
  };

  if (!isNilOrError(ideaStatus) && !isNilOrError(tenantLocales)) {
    const { color, title_multiloc, description_multiloc, code } =
      ideaStatus.attributes;
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
