import React from 'react';
import { withRouter } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import useArea from 'api/areas/useArea';
import { updateArea } from 'services/areas';

import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';

import AreaForm, { FormValues } from '../AreaForm';
import { useParams } from 'react-router-dom';

const Edit = () => {
  const { areaId } = useParams() as { areaId: string };
  const { data: area } = useArea(areaId);
  const handleSubmit = async (values: FormValues) => {
    if (!area) return;
    await updateArea(area.data.id, {
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
        <FormattedMessage {...messages.editFormTitle} />
      </SectionTitle>
      {!isNilOrError(area) && (
        <AreaForm
          defaultValues={{
            title_multiloc: area.data.attributes.title_multiloc,
            description_multiloc: area.data.attributes.description_multiloc,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default withRouter(Edit);
