import React from 'react';

import { useParams } from 'utils/router';

import useArea from 'api/areas/useArea';
import useUpdateArea from 'api/areas/useUpdateArea';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import AreaForm, { FormValues } from '../AreaForm';
import messages from '../messages';

const Edit = () => {
  const { mutate: updateArea } = useUpdateArea();
  const { areaId } = useParams({ strict: false }) as { areaId: string };
  const { data: area } = useArea(areaId);
  const handleSubmit = async (values: FormValues) => {
    if (!area) return;
    updateArea(
      {
        id: area.data.id,
        ...values,
      },
      {
        onSuccess: () => {
          clHistory.push('/admin/settings/areas');
        },
      }
    );
  };

  const goBack = () => {
    clHistory.push('/admin/settings/areas');
  };

  return (
    <Section>
      <GoBackButton onClick={goBack} />
      <SectionTitle>
        <FormattedMessage {...messages.editFormTitle} />
      </SectionTitle>
      {!isNilOrError(area) && (
        <AreaForm
          defaultValues={{
            title_multiloc: area.data.attributes.title_multiloc,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default Edit;
