import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData, PhasePlacementType } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  opened: boolean;
  target: PhasePlacementType;
  shownOnProjectPage: boolean;
  phaseToClose?: IPhaseData;
  surveyStartAt: string;
  processing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmMoveModal = ({
  opened,
  target,
  shownOnProjectPage,
  phaseToClose,
  surveyStartAt,
  processing,
  onConfirm,
  onClose,
}: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const localize = useLocalize();
  const movingOntoTimeline = target === 'on_timeline';

  return (
    <Modal
      opened={opened}
      close={onClose}
      width="450px"
      header={formatMessage(
        movingOntoTimeline
          ? messages.moveOnTimelineModalTitle
          : messages.moveOffTimelineModalTitle
      )}
      closeOnClickOutside
    >
      <Box padding="20px">
        <Text mt="0">
          {formatMessage(
            movingOntoTimeline
              ? messages.moveOnTimelineExplanation
              : messages.moveOffTimelineExplanation
          )}
        </Text>
        <Warning>
          <Box as="ul" m="0" pl="20px">
            <Text as="li" m="0">
              {formatMessage(messages.moveWarningVisibility)}
            </Text>
            {movingOntoTimeline && shownOnProjectPage && (
              <Text as="li" m="0">
                {formatMessage(messages.moveWarningWidgetRemoved)}
              </Text>
            )}
            {movingOntoTimeline && (
              <Text as="li" m="0">
                {formatMessage(messages.moveWarningTimelineOverlap)}
              </Text>
            )}
            {movingOntoTimeline && phaseToClose && (
              <Text as="li" m="0">
                {formatMessage(messages.moveWarningPreviousPhaseEnds, {
                  phaseName: localize(phaseToClose.attributes.title_multiloc),
                  date: formatDate(surveyStartAt, { dateStyle: 'long' }),
                })}
              </Text>
            )}
          </Box>
        </Warning>
        <Box display="flex" gap="8px" mt="20px" flexDirection="column">
          <Button
            onClick={onConfirm}
            processing={processing}
            data-cy="e2e-phase-placement-confirm"
          >
            {formatMessage(messages.moveConfirmButton)}
          </Button>
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            {formatMessage(messages.moveCancelButton)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmMoveModal;
