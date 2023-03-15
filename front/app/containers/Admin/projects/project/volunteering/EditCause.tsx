import React from 'react';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// Services
import { updateCause } from 'services/causes';
import useCause from 'api/causes/useCause';

// Components
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import CauseForm, { SubmitValues } from './CauseForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { useParams } from 'react-router-dom';

const EditCause = () => {
  const { projectId, causeId } = useParams() as {
    projectId: string;
    causeId: string;
  };

  const { data: cause } = useCause(causeId);

  const handleOnSubmit = async (formValues: SubmitValues) => {
    const { title_multiloc, description_multiloc, image } = formValues;

    if (title_multiloc && description_multiloc) {
      try {
        await updateCause(causeId, {
          description_multiloc,
          title_multiloc,
          image,
        });

        clHistory.push(`/admin/projects/${projectId}/volunteering`);
      } catch {
        // Do nothing
      }
    }
  };

  if (isNilOrError(cause)) {
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
