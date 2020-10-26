import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import useIdeaStatus from 'hooks/useIdeaStatus';
import { Formik } from 'formik';
import { updateIdeaStatus } from 'services/ideaStatuses';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { isCLErrorJSON } from 'utils/errorUtils';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';
import IdeaStatusForm, { FormValues } from '../IdeaStatusForm';

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 25px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 20px;
`;

const Edit = ({ params }: WithRouterProps) => {
  const { id: statusId } = params;
  const ideaStatus = useIdeaStatus({ statusId });

  const handleSubmit = () => (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    const { ...params } = values;

    updateIdeaStatus(statusId, params)
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
    return <IdeaStatusForm {...props} mode="new" builtInField={false} />;
  };

  const goBack = () => {
    clHistory.push('/admin/ideas/statuses');
  };

  if (!isNilOrError(ideaStatus)) {
    return (
      <>
        <StyledGoBackButton onClick={goBack} />
        <Section>
          <StyledSectionTitle>
            <FormattedMessage {...messages.addIdeaStatus} />
          </StyledSectionTitle>
          <Formik
            initialValues={ideaStatus.attributes}
            onSubmit={handleSubmit}
            render={renderFn}
            validate={IdeaStatusForm['validate']}
          />
        </Section>
      </>
    );
  }

  return null;
};

export default withRouter(Edit);
