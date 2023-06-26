import {
  Box,
  Button,
  Input,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import useAuthUser from 'api/me/useAuthUser';
import phasesKeys from 'api/phases/keys';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import projectsKeys from 'api/projects/keys';
import useProjectById from 'api/projects/useProjectById';
import { API_PATH } from 'containers/App/constants';
import useBasket from 'hooks/useBasket';
import React from 'react';
import { addBasket, updateBasket } from 'services/baskets';
import { useTheme } from 'styled-components';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { capitalizeParticipationContextType } from 'utils/helperUtils';
import streams from 'utils/streams';

interface Props {
  projectId: string;
  ideaId: string;
  className?: string;
}

const AssignMultipleVotesControl = ({ projectId, ideaId }: Props) => {
  const theme = useTheme();
  const [votes, setVotes] = React.useState(10);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();
  const isContinuousProject = true;
  const latestRelevantPhase = phases
    ? getLatestRelevantPhase(phases.data)
    : null;

  const participationContext = project?.data;

  const basket = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  console.log({ project, basket, authUser, participationContext });

  const onPlusClick = async (event) => {
    console.log('PLUS CLICKED');
    event.stopPropagation();
    event?.preventDefault();
    setVotes(votes + 1);

    if (basket && authUser) {
      try {
        await updateBasket(basket.id, {
          user_id: authUser.data.id,
          participation_context_id: participationContext?.id,
          idea_ids: [ideaId],
          submitted_at: null,
        });
      } catch (error) {
        console.log('Error');
      }
    } else {
      console.log('ADDING BASKET 1');
      try {
        if (authUser && participationContext) {
          console.log('ADDING BASKET 2');

          await addBasket({
            user_id: authUser.data.id,
            participation_context_id: participationContext.id,
            participation_context_type:
              capitalizeParticipationContextType('project'),
            idea_ids: [ideaId],
          });
          console.log('ADDING BASKET 3');

          await streams.fetchAllWith({
            apiEndpoint: [`${API_PATH}/users/${authUser.data.id}/baskets`],
          });

          // TODO: Remove the invalidations here after the basket data fetching PR by Iva is merged
          queryClient.invalidateQueries({
            queryKey: projectsKeys.item({ id: projectId }),
          });
          queryClient.invalidateQueries({
            queryKey: phasesKeys.list({ projectId }),
          });
        }
        console.log('ADDING BASKET 4');
      } catch (error) {
        console.log('ERROR');
      }
    }
  };

  const onMinusClick = (event) => {
    event.stopPropagation();
    event?.preventDefault();
    setVotes(votes - 1);
  };

  const onInputChange = async (event) => {
    setVotes(event);

    // try {
    //   if (basket && authUser) {
    //     await updateBasket(basket.id, {
    //       user_id: authUser.data.id,
    //       participation_context_id: participationContext?.id,
    //       idea_ids: [ideaId],
    //       submitted_at: null,
    //     });
    //   }
    // } catch (error) {
    //   console.log("Error")
    //   }
  };

  return (
    <Box display="flex">
      <Button
        mr="8px"
        bgColor={theme.colors.tenantPrimary}
        onClick={onMinusClick}
      >
        <h1 style={{ margin: '0px' }}>-</h1>
      </Button>
      <Box
        onClick={(event) => {
          event.stopPropagation();
          event?.preventDefault();
        }}
        display="flex"
        border="1px solid black"
        minWidth="200px"
        justifyContent="center"
        padding="8px"
      >
        <Box>
          <Input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            size="auto"
            value={votes.toString()}
            onChange={onInputChange}
          />
        </Box>
        <Text ml="4px" my="auto" m="0px">
          votes
        </Text>
      </Box>
      <Button
        ml="8px"
        bgColor={theme.colors.tenantPrimary}
        onClick={onPlusClick}
      >
        <h1 style={{ margin: '0px' }}>+</h1>
      </Button>
    </Box>
  );
};

export default AssignMultipleVotesControl;
