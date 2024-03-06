import React from 'react';

import { useParams } from 'react-router-dom';

import useAddCause from 'api/causes/useAddCause';

import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import CauseForm, { SubmitValues } from './CauseForm';
import messages from './messages';

const NewCause = () => {
  const { projectId, phaseId } = useParams();
  const { mutateAsync: addCause } = useAddCause();

  const handleOnSubmit = async (formValues: SubmitValues) => {
    const { title_multiloc, description_multiloc, image } = formValues;
    if (title_multiloc && description_multiloc && phaseId) {
      await addCause(
        {
          description_multiloc,
          title_multiloc,
          phase_id: phaseId,
          image,
        },
        {
          onSuccess: () => {
            clHistory.push(
              `/admin/projects/${projectId}/phases/${phaseId}/volunteering/`
            );
          },
        }
      );
    }
  };

  return (
    <div>
      <SectionTitle>
        <FormattedMessage {...messages.newCauseTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.newCauseSubtitle} />
      </SectionDescription>

      <CauseForm onSubmit={handleOnSubmit} />
    </div>
  );
};

export default NewCause;
