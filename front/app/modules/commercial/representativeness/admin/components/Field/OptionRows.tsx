import React from 'react';
import { Formik, FormikProps, FormikActions, FormikErrors } from 'formik';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import PopulationToggle from './PopulationToggle';
import PopulationInput from './PopulationInput';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';

interface Props {
  fieldId: string;
}

interface OptionValues {
  enabled: boolean;
  value?: number;
}

type FormValues = Record<string, OptionValues>;

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

const OptionRows = ({ fieldId }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(fieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) return null;

  const renderFn = () => (
    <SortableList items={userCustomFieldOptions} onReorder={console.log}>
      {({ itemsList, handleDragRow, handleDropRow }) => (
        <>
          {itemsList.map(
            ({ id, attributes }: IUserCustomFieldOptionData, index: number) => (
              <SortableRow
                key={id}
                id={id}
                index={index}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
                noStyling
              >
                <Box pl="8px" display="flex" alignItems="center" width="50%">
                  <PopulationToggle optionId={id} />

                  <Text ml="12px" variant="bodyM" color="adminTextColor">
                    {localize(attributes.title_multiloc)}
                  </Text>
                </Box>

                <Box ml="-20px" display="flex" alignItems="center" width="50%">
                  <PopulationInput optionId={id} />
                </Box>
              </SortableRow>
            )
          )}
        </>
      )}
    </SortableList>
  );

  return (
    <Formik
      initialValues={{}}
      render={renderFn}
      validate={validateForm}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    />
  );
};

export default OptionRows;
