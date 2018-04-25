import React from 'react';
import { withRouter, WithRouterProps, browserHistory } from 'react-router';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import GetArea, { GetAreaChildProps } from 'resources/GetArea';
import { updateArea } from 'services/areas';

import { Section, SectionTitle } from 'components/admin/Section';

import { Formik } from 'formik';
import AreaForm, { FormValues } from '../AreaForm';


import { API } from 'typings';
interface InputProps {}
interface DataProps {
  area: GetAreaChildProps;
}

interface Props extends InputProps, DataProps {}

class Edit extends React.PureComponent<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    const { area } = this.props;

    if (!area) return;

    updateArea(area.id, {
      ...values
    })
      .then(() => {
        browserHistory.push('/admin/settings/areas');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  renderFn = (props) => {
    return <AreaForm {...props} />;
  }

  initialValues = () => {
    const { area } = this.props;
    return area && ({
      title_multiloc: area.attributes.title_multiloc,
      description_multiloc: area.attributes.description_multiloc
    });
  }

  render() {
    const { area } = this.props;
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.editFormTitle} />
        </SectionTitle>
        { area && <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={AreaForm.validate}
        />}
      </Section>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetArea id={inputProps.params.areaId} >
    {area => (<Edit area={area} />)}
  </GetArea>
));
