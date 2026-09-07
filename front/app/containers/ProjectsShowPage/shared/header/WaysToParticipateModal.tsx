import React, { ReactNode } from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import messages from 'containers/ProjectsShowPage/messages';

import SpotlightSurveyActionButton from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/ActionButton';
import { getSpotlightSurveyState } from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/utils';
import Drawer from 'components/UI/Drawer';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  opened: boolean;
  onClose: () => void;
  methodCTA: ReactNode;
  openSurveys: IPhaseData[];
  upcomingSurveys: IPhaseData[];
}

const WaysToParticipateModal = ({
  opened,
  onClose,
  methodCTA,
  openSurveys,
  upcomingSurveys,
}: Props) => {
  const { formatMessage } = useIntl();
  const isPhone = useBreakpoint('phone');

  const sortedOpenSurveys = [...openSurveys].sort(
    (a, b) =>
      Number(getSpotlightSurveyState(a) !== 'open') -
      Number(getSpotlightSurveyState(b) !== 'open')
  );

  const openNowCount =
    (methodCTA ? 1 : 0) +
    openSurveys.filter((phase) => getSpotlightSurveyState(phase) === 'open')
      .length;
  const totalCount =
    (methodCTA ? 1 : 0) + openSurveys.length + upcomingSurveys.length;

  const header = (
    <Box>
      <Text m="0px" fontSize="l" fontWeight="bold">
        {formatMessage(messages.waysToParticipate)}
      </Text>
      <Text m="0px" color="textSecondary" fontSize="s">
        {formatMessage(messages.openNowInTotal, {
          openCount: openNowCount,
          totalCount,
        })}
      </Text>
    </Box>
  );

  const buttonStack = (
    <Box display="flex" flexDirection="column" gap="8px">
      {methodCTA}
      {sortedOpenSurveys.map((surveyPhase, index) => (
        <SpotlightSurveyActionButton
          key={surveyPhase.id}
          phase={surveyPhase}
          buttonStyle={
            !methodCTA && index === 0 ? 'primary' : 'secondary-outlined'
          }
        />
      ))}
      {upcomingSurveys.map((surveyPhase) => (
        <SpotlightSurveyActionButton
          key={surveyPhase.id}
          phase={surveyPhase}
          buttonStyle="secondary-outlined"
        />
      ))}
    </Box>
  );

  if (isPhone) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        ariaLabel={formatMessage(messages.waysToParticipate)}
        header={<Box px="16px">{header}</Box>}
      >
        {buttonStack}
      </Drawer>
    );
  }

  return (
    <Modal opened={opened} close={onClose} width={468} header={header}>
      <Box p="28px">{buttonStack}</Box>
    </Modal>
  );
};

export default WaysToParticipateModal;
