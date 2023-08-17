import React from 'react';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Topics from 'containers/UsersShowPage/Following/Topics';
import Areas from 'containers/UsersShowPage/Following/Areas';
import { useIntl } from 'utils/cl-intl';
import useAuthUser from 'api/me/useAuthUser';
import messages from '../messages';
import { RequirementStatus } from 'api/authentication/authentication_requirements/types';

interface Props {
  onSubmit: (id: string, onboarding: Record<string, RequirementStatus>) => void;
  onSkip: () => void;
}

const TopicsAndAreas = ({ onSubmit, onSkip }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  if (!authUser) return null;

  const handleSubmit = () => {
    onSubmit(authUser.data.id, { topics_and_areas: 'satisfied' });
  };

  return (
    <>
      <Box maxHeight="350px" overflowY="scroll">
        <Title variant="h4">{formatMessage(messages.topicsOfInterest)}</Title>
        <Topics />
      </Box>
      <Box maxHeight="150px" overflowY="scroll">
        <Title variant="h4">{formatMessage(messages.areasOfFocus)}</Title>
        <Areas />
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <Box my="20px" w="auto" display="flex" alignSelf="flex-end" gap="8px">
          <Button onClick={onSkip}>{formatMessage(messages.skipForNow)}</Button>
          <Button onClick={handleSubmit}>
            {formatMessage(messages.savePreferences)}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default TopicsAndAreas;
