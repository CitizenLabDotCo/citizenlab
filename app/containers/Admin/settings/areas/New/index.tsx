import React from 'react';
import styled from 'styled-components';
import { Formik } from 'formik';
import { browserHistory } from 'react-router';
import messages from '../messages';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import AreaForm from '../AreaForm';
import { FormattedMessage } from 'utils/cl-intl';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {}

export default class New extends React.Component<Props> {
  goBack = () => {
    browserHistory.push('/admin/settings/areas');
  }

  renderFn = (props) => {
    return <AreaForm {...props} />;
  }

  initialValues = () => ({
    title_multiloc: {},
    description_multiloc: {}
  });

  handleSubmit = () => {
    console.log('Help us')
  }

  render() {
    return (
      <>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addAreaButton} />
        </PageTitle>
        <PageWrapper>
          <Formik 
            initialValues={this.initialValues()}
            render={this.renderFn}
            onSubmit={this.handleSubmit}
          />
        </PageWrapper>
      </>
    )
  }
}

