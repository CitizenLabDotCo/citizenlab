import React from 'react';

import { Box, Title, Accordion } from '@citizenlab/cl2-component-library';

import useAreas from 'api/areas/useAreas';
import useAuthUser from 'api/me/useAuthUser';
import useTopics from 'api/topics/useTopics';
import { OnboardingType } from 'api/users/types';

import Areas from 'components/Areas';
import Topics from 'components/Topics';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onSubmit: (id: string, onboarding: OnboardingType) => void;
  onSkip: () => void;
}

const TopicsAndAreas = ({ onSubmit, onSkip }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const { data: areas } = useAreas({
    forOnboarding: true,
    sort: 'projects_count',
  });

  const { data: topics } = useTopics({
    forOnboarding: true,
    sort: 'projects_count',
  });

  const hasAreas = areas && areas.data.length > 0;
  const hasTopics = topics && topics.data.length > 0;

  if (!authUser) return null;

  const handleSubmit = () => {
    onSubmit(authUser.data.id, { topics_and_areas: 'satisfied' });
  };

  return (
    <>
      {hasTopics && (
        <Accordion
          isOpenByDefault
          title={
            <Title variant="h4">
              {formatMessage(messages.followYourFavoriteTopics)}
            </Title>
          }
        >
          <Topics showOnboardingTopics />
        </Accordion>
      )}
      {hasAreas && (
        <Accordion
          isOpenByDefault={!hasTopics}
          title={
            <Title variant="h4">
              {formatMessage(messages.followAreasOfFocus)}
            </Title>
          }
        >
          <Areas showOnboardingAreas />
        </Accordion>
      )}
      <Box display="flex" justifyContent="flex-end">
        <Box my="20px" w="auto" display="flex" alignSelf="flex-end" gap="8px">
          <ButtonWithLink onClick={onSkip} buttonStyle="primary-outlined">
            {formatMessage(messages.skipForNow)}
          </ButtonWithLink>
          <ButtonWithLink onClick={handleSubmit}>
            {formatMessage(messages.savePreferences)}
          </ButtonWithLink>
        </Box>
      </Box>
    </>
  );
};

export default TopicsAndAreas;
