import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import messages from 'containers/ProjectsShowPage/messages';

import ExtraSurveyActionButton from 'components/ProjectPageBuilder/Widgets/ExtraSurveys/ActionButton';
import { getExtraSurveyState } from 'components/ProjectPageBuilder/Widgets/ExtraSurveys/utils';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  opened: boolean;
  onClose: () => void;
  // The current phase's primary CTA, already rendered by ProjectActionButtons.
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

  // Open (still actionable) first, taken/not-eligible sink to the bottom of
  // the open group; upcoming surveys follow as disabled "Opens on …" buttons.
  const sortedOpenSurveys = [...openSurveys].sort(
    (a, b) =>
      Number(getExtraSurveyState(a) !== 'open') -
      Number(getExtraSurveyState(b) !== 'open')
  );

  const openNowCount =
    (methodCTA ? 1 : 0) +
    openSurveys.filter((phase) => getExtraSurveyState(phase) === 'open').length;
  const totalCount =
    (methodCTA ? 1 : 0) + openSurveys.length + upcomingSurveys.length;

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={468}
      header={
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
      }
    >
      <Box
        id="e2e-ways-to-participate-modal"
        display="flex"
        flexDirection="column"
        gap="8px"
      >
        {methodCTA}
        {sortedOpenSurveys.map((surveyPhase, index) => (
          <ExtraSurveyActionButton
            key={surveyPhase.id}
            phase={surveyPhase}
            buttonStyle={
              !methodCTA && index === 0 ? 'primary' : 'secondary-outlined'
            }
          />
        ))}
        {upcomingSurveys.map((surveyPhase) => (
          <ExtraSurveyActionButton
            key={surveyPhase.id}
            phase={surveyPhase}
            buttonStyle="secondary-outlined"
          />
        ))}
      </Box>
    </Modal>
  );
};

export default WaysToParticipateModal;
