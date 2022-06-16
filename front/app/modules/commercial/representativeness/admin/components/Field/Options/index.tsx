import React from 'react';
import { Formik, FormikProps, FormikActions, FormikErrors } from 'formik';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useReferenceDistribution from '../../../hooks/useReferenceDistribution';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Header from './Header';
import OptionToggle from './OptionToggle';
import OptionInput from './OptionInput';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getInitialValues } from './utils';

const StyledForm = styled.form`
  width: 100%;
`;

interface Props {
  fieldId: string;
}

export interface OptionValue {
  enabled: boolean;
  population?: number;
}

export type FormValues = Record<string, OptionValue>;

const validateForm = (values: FormValues): FormikErrors<FormValues> => {
  console.log(values);
  // TODO
  return {};
};

const handleSubmit = (
  values: FormValues,
  { setSubmitting, setStatus }: FormikActions<FormValues>
) => {
  console.log(values);
  console.log(setSubmitting);
  console.log(setStatus);
  // TODO
};

const Options = ({ fieldId }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(fieldId);
  const { referenceDistribution, referenceDataUploaded } =
    useReferenceDistribution(fieldId);
  const localize = useLocalize();

  if (
    isNilOrError(userCustomFieldOptions) ||
    referenceDataUploaded === undefined
  ) {
    return null;
  }

  const renderFn = ({
    isSubmitting,
    touched,
    status,
    handleSubmit,
  }: FormikProps<FormValues>) => (
    <StyledForm onSubmit={handleSubmit}>
      <Box>
        <Box
          background="#FCFCFC"
          width="100%"
          height="100%"
          border={`1px ${colors.separation} solid`}
          pt="20px"
          pb="12px"
          px="16px"
        >
          <Header />

          {userCustomFieldOptions.map(({ id, attributes }) => (
            <Box key={id} display="flex">
              <Box display="flex" alignItems="center" width="50%">
                <OptionToggle optionId={id} />

                <Text ml="12px" variant="bodyM" color="adminTextColor">
                  {localize(attributes.title_multiloc)}
                </Text>
              </Box>

              <Box display="flex" alignItems="center" width="50%">
                <OptionInput optionId={id} />
              </Box>
            </Box>
          ))}
        </Box>

        <Box mt="20px">
          <FormikSubmitWrapper
            isSubmitting={isSubmitting}
            status={status}
            touched={touched}
          />
        </Box>
      </Box>
    </StyledForm>
  );

  return (
    <Formik
      initialValues={getInitialValues(
        userCustomFieldOptions,
        referenceDataUploaded,
        referenceDistribution
      )}
      render={renderFn}
      validate={validateForm}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    />
  );
};

export default Options;
