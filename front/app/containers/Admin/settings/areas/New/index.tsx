import React from 'react';
import clHistory from 'utils/cl-router/history';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import AreaForm, { FormValues } from '../AreaForm';

import { addArea } from 'services/areas';

const New = () => {
  const handleSubmit = async (values: FormValues) => {
    await addArea({
      ...values,
    });

    clHistory.push('/admin/settings/areas');
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
