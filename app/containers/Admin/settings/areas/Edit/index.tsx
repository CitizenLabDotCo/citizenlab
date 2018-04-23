import React from 'react';
import { withRouter, WithRouterProps, browserHistory } from 'react-router';
import { Formik } from 'formik';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import GetArea, { GetAreaChildProps } from 'resources/GetArea';

import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import AreaForm, { FormValues } from '../AreaForm';
import PageWrapper from 'components/admin/PageWrapper';

interface InputProps {}

interface DataProps {
  area: GetAreaChildProps
}

interface Props extends InputProps, DataProps {}

class Edit extends React.PureComponent<Props> {
  
  handleSubmit = () => {
    return;
  }
  
  goBack = () => {
    browserHistory.push('/admin/settings/areas');
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
      <>
        <Section>
          <GoBackButton onClick={this.goBack} />
          <SectionTitle>
            <FormattedMessage {...messages.editFormTitle} />
          </SectionTitle>
        </Section>
        <PageWrapper>
        { area && <Formik 
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={AreaForm.validate}
        />}
      </PageWrapper>
     </>
    )
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps ) => (
  <GetArea id={inputProps.params.areaId} >
    {area => (<Edit area={area} />)}
  </GetArea>
));