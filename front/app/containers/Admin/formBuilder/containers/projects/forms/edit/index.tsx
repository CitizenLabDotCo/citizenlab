import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams } from 'react-router-dom';
import { clone } from 'lodash-es';

// styles
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';
import FormBuilderTopBar from 'containers/Admin/formBuilder/components/FormBuilderTopBar';
import FormBuilderToolbox from 'containers/Admin/formBuilder/components/FormBuilderToolbox';
import FormBuilderSettings from 'containers/Admin/formBuilder/components/FormBuilderSettings';
import FormFields from 'containers/Admin/formBuilder/components/FormFields';
import Error from 'components/UI/Error';

// utils
import { isNilOrError, isNil } from 'utils/helperUtils';

import {
  IFlatCreateCustomField,
  IFlatCustomField,
} from 'services/formCustomFields';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';

import { CLErrors, CLError } from 'typings';

import messages from '../messages';

import { FormattedMessage } from 'utils/cl-intl';

const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

type SelectedError = {
  [fieldId: string]: CLError[] | null;
} | null;

export const FormEdit = () => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomField | undefined
  >(undefined);
  const { projectId } = useParams() as { projectId: string };

  const { formCustomFields, setFormCustomFields } = useFormCustomFields({
    projectId,
  });

  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const [selectedFieldError, setSelectedFieldError] =
    useState<SelectedError>(null);

  const closeSettings = () => {
    setSelectedField(undefined);
  };

  const handleDelete = async (fieldId: string) => {
    if (!isNilOrError(formCustomFields)) {
      const newFields = formCustomFields.filter(
        (field) => field.id !== fieldId
      );
      setFormCustomFields(newFields);
      closeSettings();
    }
  };

  // TODO: Improve this to remove usage of type casting
  const onAddField = (field: IFlatCreateCustomField) => {
    if (!isNilOrError(formCustomFields)) {
      setFormCustomFields(formCustomFields.concat([field as IFlatCustomField]));
    } else if (isNil(formCustomFields)) {
      setFormCustomFields([field as IFlatCustomField]);
    }
    setSelectedField(field as IFlatCustomField);
  };

  const onFieldChange = (fieldToUpdate: IFlatCustomField) => {
    if (!isNilOrError(formCustomFields)) {
      setFormCustomFields(
        formCustomFields.map((field) => {
          return field.id === fieldToUpdate.id ? fieldToUpdate : field;
        })
      );
    }
  };

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    if (isNilOrError(formCustomFields)) return;

    const newFields = clone(formCustomFields);
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    setFormCustomFields(newFields);

    if (apiErrors) {
      const newErrors = {} as CLErrors;
      Object.keys(apiErrors).forEach((key) => {
        if (Number(key) === fromIndex) {
          newErrors[toIndex.toString()] = apiErrors[key];
        } else if (Number(key) === toIndex) {
          newErrors[fromIndex.toString()] = apiErrors[key];
        } else {
          newErrors[key] = apiErrors[key];
        }
      });
      setApiErrors(newErrors);
    }
  };

  const handleDropRow = (fieldId: string, toIndex: number) => {
    if (!isNilOrError(formCustomFields)) {
      const newFields = clone(formCustomFields);
      const [removed] = newFields.splice(
        newFields.findIndex((field) => field.id === fieldId),
        1
      );
      newFields.splice(toIndex, 0, removed);
      setFormCustomFields(newFields);
    }
  };

  const onEditField = (field: IFlatCustomField) => {
    if (isNilOrError(formCustomFields)) return;

    const fieldIndex = formCustomFields.findIndex(
      (fieldInArray) => fieldInArray.id === field.id
    );

    if (fieldIndex !== -1) {
      setSelectedFieldError({
        [field.id]: apiErrors
          ? (apiErrors[fieldIndex.toString()] as CLError[])
          : null,
      });
    }

    setSelectedField(field);
  };

  const setErrorsOnSave = (errors: CLErrors) => {
    if (selectedField && !isNilOrError(formCustomFields)) {
      const fieldIndex = formCustomFields.findIndex(
        (fieldInArray) => fieldInArray.id === selectedField.id
      );

      setSelectedFieldError({
        [selectedField.id]: errors[fieldIndex.toString()] as CLError[],
      });
    }
    setApiErrors(errors);
  };

  const updateApiErrors = (fieldId: string, errors: SelectedError) => {
    if (!isNilOrError(errors)) {
      const fieldIndex = (formCustomFields as IFlatCustomField[]).findIndex(
        (fieldInArray) => fieldInArray.id === fieldId
      );
      setSelectedFieldError(errors);
      const updatedErrors = {
        ...apiErrors,
        [fieldIndex]: errors[fieldId] as unknown as CLError[],
      };
      setApiErrors(updatedErrors);
    }
  };

  const showErrorMessage = !!Object.values(apiErrors || {}).find(
    (apiError) => Object.keys(apiError).length > 0
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.adminBackground}
      h="100vh"
    >
      <FocusOn>
        <FormBuilderTopBar
          formCustomFields={formCustomFields}
          setApiErrors={setErrorsOnSave}
        />
        <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
          <FormBuilderToolbox onAddField={onAddField} />
          <StyledRightColumn>
            <Box width="1000px">
              <Box mb="16px">
                {showErrorMessage && (
                  <Error
                    marginTop="8px"
                    marginBottom="8px"
                    text={<FormattedMessage {...messages.errorMessage} />}
                    scrollIntoView={false}
                  />
                )}
              </Box>
              <Box bgColor="white" minHeight="300px">
                {!isNilOrError(formCustomFields) && (
                  <FormFields
                    onEditField={onEditField}
                    formCustomFields={formCustomFields}
                    handleDragRow={handleDragRow}
                    handleDropRow={handleDropRow}
                    selectedFieldId={selectedField?.id}
                    apiErrors={apiErrors}
                  />
                )}
              </Box>
            </Box>
          </StyledRightColumn>
          {!isNilOrError(selectedField) && (
            <FormBuilderSettings
              key={selectedField.id}
              field={selectedField}
              onDelete={handleDelete}
              onFieldChange={onFieldChange}
              onClose={closeSettings}
              errors={selectedFieldError}
              setErrors={updateApiErrors}
            />
          )}
        </Box>
      </FocusOn>
    </Box>
  );
};

const FormBuilderPage = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<FormEdit />, modalPortalElement)
    : null;
};

export default FormBuilderPage;
