import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import GetArea, { GetAreaChildProps } from 'resources/GetArea';
import { updateArea } from 'services/areas';

import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';

import AreaForm, { FormValues } from '../AreaForm';

interface DataProps {
  area: GetAreaChildProps;
}

interface Props extends DataProps {}

const Edit = ({ area }: Props) => {
  const handleSubmit = async (values: FormValues) => {
    if (isNilOrError(area)) return;
    await updateArea(area.id, {
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
            title_multiloc: area.attributes.title_multiloc,
            description_multiloc: area.attributes.description_multiloc,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default withRouter((inputProps: WithRouterProps) => (
  <GetArea id={inputProps.params.areaId}>
    {(area) => <Edit area={area} />}
  </GetArea>
));
