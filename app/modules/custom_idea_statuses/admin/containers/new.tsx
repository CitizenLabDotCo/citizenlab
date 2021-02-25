import React from 'react';
import styled from 'styled-components';
import { addIdeaStatus } from 'services/ideaStatuses';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

// components
import GoBackButton from 'components/UI/GoBackButton';
import IdeaStatusForm, {
  FormValues,
  validate,
} from '../components/IdeaStatusForm';
import { Formik } from 'formik';
import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { isCLErrorJSON } from 'utils/errorUtils';

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const NewIdeaStatus = () => {
  const tenantLocales = useAppConfigurationLocales();
  const handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    const { ...params } = values;
    addIdeaStatus(params)
      .then((_response) => {
        goBack();
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

  const renderFn = (props) => {
    return <IdeaStatusForm {...props} />;
  };

  const goBack = () => {
    clHistory.push('/admin/ideas/statuses');
  };

  if (!isNilOrError(tenantLocales)) {
    return (
      <Section>
        <GoBackButton onClick={goBack} />
        <StyledSectionTitle>
          <FormattedMessage {...messages.addIdeaStatus} />
        </StyledSectionTitle>
        <Formik
          initialValues={{
            color: '#b5b5b5',
            title_multiloc: {},
            description_multiloc: {},
            code: 'proposed',
          }}
          onSubmit={handleSubmit}
          render={renderFn}
          validate={validate(tenantLocales)}
        />
      </Section>
    );
  }

  return null;
};

export default NewIdeaStatus;
