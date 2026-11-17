import React, { useState } from 'react';

import { Text, Box, Button, Spinner } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import usePhases from 'api/phases/usePhases';

import ProjectFilter from 'containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/ProjectFilter';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';
import phaseFilterMessages from 'components/UI/PhaseFilter/messages';
import Warning from 'components/UI/Warning';

import Banner from 'design-system/Banner';
import { FieldLabel } from 'design-system/Field';
import { ListBoxOption } from 'design-system/ListBox';
import DesignSystemModal from 'design-system/Modal';
import DesignSystemSelect from 'design-system/Select';
import DesignSystemSpinner from 'design-system/Spinner';
import 'design-system/tokens.css';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import styles from './CopySurveyModal.module.css';
import messages from './messages';

type Props = {
  showCopySurveyModal: boolean;
  setShowCopySurveyModal: (show: boolean) => void;
  editFormLink: string;
  surveyFormPersisted: boolean;
  surveyFormLoading?: boolean;
  variant?: 'panel';
};

const CopySurveyModal = ({
  showCopySurveyModal,
  setShowCopySurveyModal,
  editFormLink,
  surveyFormPersisted,
  surveyFormLoading = false,
  variant,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const [projectId, setProjectId] = useState<string>();
  const [phaseId, setPhaseId] = useState<string>();

  const {
    data: phases,
    isFetching,
    isPlaceholderData,
  } = usePhases(projectId, 'all');
  const canDuplicate =
    !surveyFormLoading &&
    !isFetching &&
    !isPlaceholderData &&
    phases?.data.some(
      (phase) =>
        phase.id === phaseId &&
        phase.relationships.project.data.id === projectId &&
        phase.attributes.participation_method === 'native_survey'
    );

  const close = () => {
    setProjectId(undefined);
    setPhaseId(undefined);
    setShowCopySurveyModal(false);
  };

  const handleProjectFilter = ({ value }: { value: string | undefined }) => {
    setProjectId(value);
    setPhaseId(undefined);
  };

  const handlePhaseFilter = ({ value }: IOption) => {
    setPhaseId(value);
  };

  const duplicate = () => {
    if (!canDuplicate) return;

    const url = `${editFormLink}?copy_from=${phaseId}`;
    close();
    clHistory.push(url);
  };

  if (variant === 'panel') {
    const surveyPhases = phases?.data.filter(
      (phase) => phase.attributes.participation_method === 'native_survey'
    );

    return (
      <DesignSystemModal
        isOpen={showCopySurveyModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) close();
        }}
        title={formatMessage(messages.copySurveyTitle)}
        description={formatMessage(messages.copySurveyDescription)}
        size={560}
        data-cy="e2e-copy-survey-modal"
        primaryAction={{
          label: formatMessage(messages.duplicate),
          isDisabled: !canDuplicate,
          onPress: duplicate,
          'data-cy': 'e2e-copy-survey-modal-duplicate',
        }}
        secondaryAction={{
          label: formatMessage(messages.cancel),
          onPress: close,
        }}
      >
        <div className={styles.body}>
          {surveyFormLoading && <DesignSystemSpinner />}
          {!surveyFormLoading && surveyFormPersisted && (
            <Banner tone="warning">
              {formatMessage(messages.surveyFormPersistedWarning)}
            </Banner>
          )}
          {/* ProjectFilter is kept: it searches and loads the projects itself. */}
          <div className={styles.field}>
            <FieldLabel>{formatMessage(messages.project)}</FieldLabel>
            <ProjectFilter
              projectId={projectId}
              participationMethods={['native_survey']}
              placeholder={formatMessage(messages.selectSurveyProject)}
              emptyOptionMessage={messages.noProject}
              onProjectFilter={handleProjectFilter}
            />
          </div>
          {projectId !== undefined &&
            (!surveyPhases ? (
              <DesignSystemSpinner />
            ) : surveyPhases.length === 0 ? (
              <Banner tone="error">
                {formatMessage(phaseFilterMessages.noAppropriatePhases)}
              </Banner>
            ) : (
              <DesignSystemSelect
                id="e2e-phase-filter"
                label={formatMessage(messages.survey)}
                size={32}
                value={phaseId ?? null}
                onChange={(key) =>
                  setPhaseId(typeof key === 'string' ? key : undefined)
                }
              >
                {surveyPhases.map((phase) => (
                  <ListBoxOption key={phase.id} id={phase.id}>
                    {localize(phase.attributes.title_multiloc)}
                  </ListBoxOption>
                ))}
              </DesignSystemSelect>
            ))}
        </div>
      </DesignSystemModal>
    );
  }

  return (
    <Modal
      width={520}
      opened={showCopySurveyModal}
      close={close}
      header={formatMessage(messages.copySurveyTitle)}
    >
      <Box m="24px" data-cy="e2e-copy-survey-modal">
        {surveyFormLoading && <Spinner />}
        {!surveyFormLoading && surveyFormPersisted && (
          <Warning>
            <Text color="primary" m="0px" fontSize="s">
              {formatMessage(messages.surveyFormPersistedWarning)}
            </Text>
          </Warning>
        )}
        <Text mb="10px" variant="bodyS" color="textSecondary">
          {formatMessage(messages.copySurveyDescription)}
        </Text>
        <Box py="5px" mt="0px" alignItems="center">
          <ProjectFilter
            projectId={projectId}
            emptyOptionMessage={messages.noProject}
            onProjectFilter={handleProjectFilter}
          />
          {projectId !== undefined && (
            <PhaseFilter
              label={formatMessage(messages.survey)}
              projectId={projectId}
              phaseId={phaseId}
              participationMethods={['native_survey']}
              placementType="all"
              onPhaseFilter={handlePhaseFilter}
            />
          )}
        </Box>

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button p="0px" m="0px" buttonStyle="text" onClick={close}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            disabled={!canDuplicate}
            onClick={duplicate}
            data-cy="e2e-copy-survey-modal-duplicate"
          >
            {formatMessage(messages.duplicate)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CopySurveyModal;
