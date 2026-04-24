import React, { useState } from 'react';

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
}: {
  projectId: string;
  phaseId: string;
}) => {
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copy_from');
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);
  const [startedFromScratch, setStartedFromScratch] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId: copyFrom ? copyFrom : phaseId,
    copy: copyFrom ? true : false,
  });

  if (!phase || !project || !formCustomFields) return null;

  // Reset option and statement IDs if this is a new or copied form
  const isFormPersisted = copyFrom
    ? false
    : phase.data.attributes.custom_form_persisted;

  const isNewForm = !isFormPersisted && !copyFrom;

  const newCustomFields = isFormPersisted
    ? formCustomFields
    : clearOptionAndStatementIds(formCustomFields);

  const editFormLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`;

  const emptyStateContent =
    isNewForm && !startedFromScratch ? (
      <NewSurveyEmptyState
        onStartFromScratch={() => setStartedFromScratch(true)}
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

  if (typeof projectId !== 'string' || typeof phaseId !== 'string') {
    return null;
  }

  return <SurveyFormBuilder projectId={projectId} phaseId={phaseId} />;
};
