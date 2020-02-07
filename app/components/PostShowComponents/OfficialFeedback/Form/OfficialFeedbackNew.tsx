import React, { PureComponent } from 'react';
import { addOfficialFeedbackToIdea, addOfficialFeedbackToInitiative } from 'services/officialFeedback';
import OfficialFeedbackForm, { OfficialFeedbackFormValues } from './OfficialFeedbackForm';
import { CLErrorsJSON } from 'typings';
import { adopt } from 'react-adopt';
import { map } from 'lodash-es';

// resources
import GetTenantLocales, {  GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// utils
import { isPage, isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

// typings
import { Multiloc } from 'typings';

// stylings
import styled from 'styled-components';

const Container = styled.div``;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  processing: boolean;
  formValues: OfficialFeedbackFormValues | null;
}

class OfficialFeedbackNew extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      formValues: null
    };
  }

  componentDidMount() {
    this.initState(null);
  }

  componentDidUpdate(prevProps: Props) {
    this.initState(prevProps);
  }

  initState = (prevProps: Props | null) => {
    const { tenantLocales } = this.props;

    if (isNilOrError(prevProps?.tenantLocales) && !isNilOrError(tenantLocales)) {
      this.setState({ formValues: this.resetFormValues(tenantLocales) });
    }
  }

  resetFormValues = (tenantLocales: string[]) => {
    const formValues = {
      bodyMultiloc: {},
      authorMultiloc: {}
    };

    tenantLocales.forEach((locale) => {
      formValues.bodyMultiloc[locale] = '';
      formValues.authorMultiloc[locale] = '';
    });

    return formValues;
  }

  handleOnChange = (formValues: OfficialFeedbackFormValues) => {
    this.setState({ formValues });
  }

  // handleSubmit = async (values: FormValues, { setErrors, setSubmitting, setStatus, resetForm }) => {
  handleOnSubmit = async (formValues: OfficialFeedbackFormValues) => {

    const { postId, postType, tenantLocales } = this.props;

    const feedbackValues = {
      author_multiloc: formValues.authorMultiloc,
      body_multiloc: map(formValues.bodyMultiloc, (bodyText) => (bodyText || '').replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2')) as Multiloc
    };

    this.setState({ processing: true });

    try {
      if (postType === 'idea') {
        await addOfficialFeedbackToIdea(postId, feedbackValues);
      } else if (postType === 'initiative') {
        await addOfficialFeedbackToInitiative(postId, feedbackValues);
      }

      this.setState({
        processing: false,
        formValues: this.resetFormValues(tenantLocales as string[])
      });
      // setStatus('success');
    } catch (errorResponse) {
      // if (isCLErrorJSON(errorResponse)) {
      //   const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
      //   setErrors(apiErrors);
      // } else {
      //   setStatus('error');
      // }

      this.setState({ processing: false });
    }

    // analytics
    if (postType === 'idea') {
      trackEventByName(tracks.officialFeedbackGiven, { location: isPage('admin', location.pathname) ? 'Admin/idea manager' : 'Citizen/idea page' });
    } else if (postType === 'initiative') {
      trackEventByName(tracks.officialFeedbackGiven, { location: isPage('admin', location.pathname) ? 'Admin/initiative manager' : 'Citizen/initiative page' });
    }
  }

  render() {
    const { className } = this.props;
    const { formValues, processing } = this.state;

    if (formValues !== null) {
      return (
        <Container className={className} >
          <OfficialFeedbackForm
            formValues={formValues}
            onSubmit={this.handleOnChange}
            onChange={this.handleOnSubmit}
            editForm={false}
            processing={processing}
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedbackNew {...inputProps} {...dataProps} />}
  </Data>
);
