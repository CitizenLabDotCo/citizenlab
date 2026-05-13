import React, { useRef, useState } from 'react';

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
  const [startFromScratch, setStartFromScratch] = useState(false);
  const [showCopySurveyModal, setShowCopySurveyModal] = useState(false);

  // Keep the FormBuilder key stable once a copy has been initiated. We only
  // want a remount when copy_from is added (to load the copied data), not
  // when it's removed (e.g. on save), since the form state already reflects
  // the copied questions.
  const lastCopyFromRef = useRef<string | null>(null);
  if (copyFrom) {
    lastCopyFromRef.current = copyFrom;
  }
  const formBuilderKey = lastCopyFromRef.current || 'new-form';

  const { data: formCustomFields, isFetching: isFetchingFields } =
    useFormCustomFields({
      projectId,
      phaseId: copyFrom ? copyFrom : phaseId,
      copy: copyFrom ? true : false,
    });

  if (
    !phase ||
    !project ||
    !formCustomFields ||
    (isFetchingFields && copyFrom)
  ) {
    return null;
  }

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
    isNewForm && !startFromScratch ? (
      <NewSurveyEmptyState
        onStartFromScratch={() => setStartFromScratch(true)}
        onDuplicateExisting={() => setShowCopySurveyModal(true)}
      />
    ) : undefined;

  return (
    <>
      <FormBuilder
        key={formBuilderKey}
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
        showCopySurveyModal={showCopySurveyModal}
        setShowCopySurveyModal={setShowCopySurveyModal}
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
