import React from 'react';

import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useUpdateIdeaStatus from 'api/idea_statuses/useUpdateIdeaStatus';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import IdeaStatusForm, { FormValues } from '../components/IdeaStatusForm';

import messages from './messages';

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 25px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const Edit = ({ variant }: { variant: IdeaStatusParticipationMethod }) => {
  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: { participation_method: variant },
  });
  const { statusId } = useParams() as { statusId: string };
  const { data: ideaStatus } = useIdeaStatus(statusId);
  const { mutateAsync: updateIdeaStatus } = useUpdateIdeaStatus();
  const tenantLocales = useAppConfigurationLocales();

  const handleSubmit = async (values: FormValues) => {
    const { ...params } = values;

    await updateIdeaStatus({
      id: statusId,
      requestBody: { ...params, participation_method: variant },
    });
    goBack();
  };

  const goBack = () => {
    clHistory.push(`/admin/settings/statuses/${variant}`);
  };

  if (ideaStatuses && ideaStatus && tenantLocales) {
    const { color, title_multiloc, description_multiloc, code, locked } =
      ideaStatus.data.attributes;
    return (
      <div data-testid="e2e-edit-status-page">
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
            showCategorySelector={!locked}
            variant={variant}
          />
        </Section>
      </div>
    );
  }

  return null;
};

export default Edit;
