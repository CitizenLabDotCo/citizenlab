import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IPhaseData, PhasePlacementType } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { linkedSurveyPhaseIds } from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/linkedSurveyPhaseIds';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import ConfirmMoveModal from './ConfirmMoveModal';

interface Props {
  phase: IPhaseData;
  hasUnsavedChanges: boolean;
}

const PhasePlacement = ({ phase, hasUnsavedChanges }: Props) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const { mutate: updatePhase, isPending } = useUpdatePhase();
  const queryClient = useQueryClient();
  const projectId = phase.relationships.project.data.id;
  const isSurvey = phase.attributes.participation_method === 'native_survey';
  const onTimeline = isTimelinePhase(phase);
  // Only a standalone survey can be shown in a project page block.
  const { data: layout } = useProjectPageLayout(
    projectId,
    isSurvey && !onTimeline
  );

  // Only surveys can run alongside the timeline, so no other method can be moved.
  if (!isSurvey) return null;

  const target: PhasePlacementType = onTimeline ? 'standalone' : 'on_timeline';

  const handleConfirm = () => {
    setErrors(null);
    updatePhase(
      { phaseId: phase.id, placement_type: target },
      {
        onSuccess: () => {
          // Moving onto the timeline drops the project page block that showed
          // this survey, so the cached layout is stale.
          queryClient.invalidateQueries({
            queryKey: projectPageLayoutKeys.item({ projectId }),
          });
          setModalOpened(false);
        },
        onError: (error) => {
          setErrors(error.errors);
          setModalOpened(false);
        },
      }
    );
  };

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.placementLabel} />
      </SubSectionTitle>
      <Text mt="0" color="textSecondary">
        <FormattedMessage
          {...(onTimeline
            ? messages.placementOnTimelineDescription
            : messages.placementStandaloneDescription)}
        />
      </Text>
      <Box display="flex">
        <Button
          type="button"
          buttonStyle="secondary-outlined"
          size="s"
          width="auto"
          icon="calendar"
          disabled={hasUnsavedChanges}
          data-cy="e2e-phase-placement-move"
          onClick={() => setModalOpened(true)}
        >
          <FormattedMessage
            {...(onTimeline
              ? messages.moveOffTimelineButton
              : messages.moveOnTimelineButton)}
          />
        </Button>
      </Box>
      {hasUnsavedChanges && (
        <Text mb="0" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.moveSaveChangesFirst} />
        </Text>
      )}
      <Error apiErrors={errors?.base} />
      <Error apiErrors={errors?.participation_method} />
      <Error apiErrors={errors?.end_at} />
      {errors?.previous_phase && (
        <Error
          text={<FormattedMessage {...messages.movePreviousPhaseError} />}
        />
      )}
      <ConfirmMoveModal
        opened={modalOpened}
        target={target}
        shownOnProjectPage={linkedSurveyPhaseIds(
          layout?.data.attributes.craftjs_json
        ).has(phase.id)}
        processing={isPending}
        onConfirm={handleConfirm}
        onClose={() => setModalOpened(false)}
      />
    </SectionField>
  );
};

export default PhasePlacement;
