import React from 'react';

import useAddArea from 'api/areas/useAddArea';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import AreaForm, { FormValues } from '../AreaForm';
import messages from '../messages';

const New = () => {
  const { mutate: addArea } = useAddArea();
  const handleSubmit = async (values: FormValues) => {
    addArea(
      {
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
        <FormattedMessage {...messages.addAreaButton} />
      </SectionTitle>
      <AreaForm onSubmit={handleSubmit} />
    </Section>
  );
};

export default New;
