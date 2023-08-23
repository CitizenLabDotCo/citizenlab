import React from 'react';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Topics from 'components/Topics';
import Areas from 'components/Areas';
import { useIntl } from 'utils/cl-intl';
import useAuthUser from 'api/me/useAuthUser';
import messages from '../messages';
import { RequirementStatus } from 'api/authentication/authentication_requirements/types';
import useAreas from 'api/areas/useAreas';
import useTopics from 'api/topics/useTopics';

interface Props {
  onSubmit: (id: string, onboarding: Record<string, RequirementStatus>) => void;
  onSkip: () => void;
}

const TopicsAndAreas = ({ onSubmit, onSkip }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: areas } = useAreas({ forHomepageFilter: true });
  const { data: topics } = useTopics({ forHomepageFilter: true });
  const hasAreas = areas && areas.data.length > 0;
  const hasTopics = topics && topics.data.length > 0;

  if (!authUser) return null;

  const handleSubmit = () => {
    onSubmit(authUser.data.id, { topics_and_areas: 'satisfied' });
  };

  return (
    <>
      {hasTopics && (
        <Box maxHeight="350px" overflowY="scroll">
          <Title variant="h4">
            {formatMessage(messages.followYourFavoriteTopics)}
          </Title>
          <Topics showHomePageTopcs />
        </Box>
      )}
      {hasAreas && (
        <Box maxHeight="150px" overflowY="scroll">
          <Title variant="h4">
            {formatMessage(messages.followAreasOfFocus)}
          </Title>
          <Areas showHomePageAreas />
        </Box>
      )}
      <Box display="flex" justifyContent="flex-end">
        <Box my="20px" w="auto" display="flex" alignSelf="flex-end" gap="8px">
          <Button onClick={onSkip} buttonStyle="secondary">
            {formatMessage(messages.skipForNow)}
          </Button>
          <Button onClick={handleSubmit}>
            {formatMessage(messages.savePreferences)}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default TopicsAndAreas;
