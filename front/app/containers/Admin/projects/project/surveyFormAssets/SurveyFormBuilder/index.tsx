import React, { useState, useEffect } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import FormBuilder from 'components/FormBuilder/edit';

import NewSurveyEmptyState from '../../nativeSurvey/NewSurveyEmptyState';
import CopySurveyModal from '../CopySurveyModal';
import { nativeSurveyConfig, clearOptionAndStatementIds } from '../utils';

const SurveyFormBuilder = ({
  projectId,
  phaseId,
  initialCopyFrom,
}: {
  projectId: string;
  phaseId: string;
  initialCopyFrom: string | null;
}) => {
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId: initialCopyFrom ? initialCopyFrom : phaseId,
    copy: initialCopyFrom ? true : false,
  });

  if (!phase || !project || !formCustomFields) return null;

  // Reset option and statement IDs if this is a new or copied form
  const isFormPersisted = initialCopyFrom
    ? false
    : phase.data.attributes.custom_form_persisted;

  const isNewForm = !isFormPersisted && !initialCopyFrom;

  const newCustomFields = isFormPersisted
    ? formCustomFields
    : clearOptionAndStatementIds(formCustomFields);

  const editFormLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`;

  const emptyStateContent =
    isNewForm && !hasStarted ? (
      <NewSurveyEmptyState
        onStartFromScratch={() => setHasStarted(true)}
        onDuplicateExisting={() => setShowCopyModal(true)}
      />
    ) : undefined;

  return (
    <>
      <FormBuilder
        builderConfig={{
          ...nativeSurveyConfig,
          formCustomFields: newCustomFields,
          goBackUrl: `/admin/projects/${projectId}/phases/${phaseId}/survey-form`,
        }}
        viewFormLink={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`}
        emptyStateContent={emptyStateContent}
      />
      <CopySurveyModal
        editFormLink={editFormLink}
        showCopySurveyModal={showCopyModal}
        setShowCopySurveyModal={setShowCopyModal}
        surveyFormPersisted={false}
      />
    </>
  );
};

export default () => {
  const { projectId, phaseId } = useParams();
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copy_from');

  // Track copy_from in state so that only new copy initiations (non-null)
  // trigger a remount via the key. When resetCopyFrom() clears the param
  // after save, copyFrom becomes null — but we keep the key stable to
  // prevent a remount that would reset FormBuilder's internal state.
  const [mountKey, setMountKey] = useState(copyFrom);

  useEffect(() => {
    if (copyFrom !== null && copyFrom !== mountKey) {
      setMountKey(copyFrom);
    }
  }, [copyFrom, mountKey]);

  if (typeof projectId !== 'string' || typeof phaseId !== 'string') {
    return null;
  }

  return (
    <SurveyFormBuilder
      key={`${phaseId}-${mountKey}`}
      projectId={projectId}
      phaseId={phaseId}
      initialCopyFrom={mountKey}
    />
  );
};
