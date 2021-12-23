import React from 'react';
import { InjectedFormikProps } from 'formik';
import styled from 'styled-components';

// components
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section } from 'components/admin/Section';

const StyledSection = styled(Section)`
  margin-bottom: 30px;
`;

interface Props {
  children: React.ReactNode;
}

const BasePageForm = ({
  isSubmitting,
  touched,
  status,
  handleSubmit,
  setTouched,
  children,
}: InjectedFormikProps<Props, Record<string, any>>) => {
  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit();
    setTouched({});
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <StyledSection>{children}</StyledSection>

      <FormikSubmitWrapper
        isSubmitting={isSubmitting}
        status={status}
        touched={touched}
      />
    </form>
  );
};

export default BasePageForm;
