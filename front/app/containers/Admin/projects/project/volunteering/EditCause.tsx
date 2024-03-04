import React from 'react';

import { useParams } from 'react-router-dom';

import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import useCause from 'api/causes/useCause';
import useUpdateCause from 'api/causes/useUpdateCause';

import CauseForm, { SubmitValues } from './CauseForm';
import messages from './messages';

const EditCause = () => {
  const { mutateAsync: updateCause } = useUpdateCause();
  const { projectId, causeId, phaseId } = useParams() as {
    projectId: string;
    causeId: string;
    phaseId: string;
  };
  const { data: cause } = useCause(causeId);

  const handleOnSubmit = async (formValues: SubmitValues) => {
    const { title_multiloc, description_multiloc, image } = formValues;

    if (title_multiloc && description_multiloc) {
      await updateCause(
        {
          id: causeId,
          requestBody: {
            description_multiloc,
            title_multiloc,
            image,
          },
        },
        {
          onSuccess: () => {
            clHistory.push(
              `/admin/projects/${projectId}/phases/${phaseId}/volunteering`
            );
          },
        }
      );
    }
  };

  if (!cause) {
    return null;
  }

  return (
    <div>
      <SectionTitle>
        <FormattedMessage {...messages.editCauseTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.editCauseSubtitle} />
      </SectionDescription>
      <CauseForm
        onSubmit={handleOnSubmit}
        defaultValues={{
          title_multiloc: cause.data.attributes.title_multiloc,
          description_multiloc: cause.data.attributes.description_multiloc,
        }}
        imageUrl={cause.data.attributes.image?.medium}
      />
    </div>
  );
};

export default EditCause;
