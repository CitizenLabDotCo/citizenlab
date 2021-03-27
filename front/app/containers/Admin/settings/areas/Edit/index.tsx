import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import GetArea, { GetAreaChildProps } from 'resources/GetArea';
import { updateArea } from 'services/areas';

import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';

import { Formik } from 'formik';
import AreaForm, { FormValues } from '../AreaForm';

import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';
interface InputProps {}
interface DataProps {
  area: GetAreaChildProps;
}

interface Props extends InputProps, DataProps {}

class Edit extends React.PureComponent<Props> {
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    const { area } = this.props;

    if (isNilOrError(area)) return;

    updateArea(area.id, {
      ...values,
    })
      .then(() => {
        clHistory.push('/admin/settings/areas');
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  renderFn = (props) => {
    return <AreaForm {...props} />;
  };

  goBack = () => {
    clHistory.push('/admin/settings/areas');
  };

  render() {
    const { area } = this.props;
    return (
      <Section>
        <GoBackButton onClick={this.goBack} />
        <SectionTitle>
          <FormattedMessage {...messages.editFormTitle} />
        </SectionTitle>
        {!isNilOrError(area) && (
          <Formik
            initialValues={{
              title_multiloc: area.attributes.title_multiloc,
              description_multiloc: area.attributes.description_multiloc,
            }}
            render={this.renderFn}
            onSubmit={this.handleSubmit}
            validate={(AreaForm as any).validate}
          />
        )}
      </Section>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetArea id={inputProps.params.areaId}>
    {(area) => <Edit area={area} />}
  </GetArea>
));
