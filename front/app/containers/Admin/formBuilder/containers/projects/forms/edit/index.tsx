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

// utils
import { isNilOrError, isNil } from 'utils/helperUtils';

import {
  IFlatCreateCustomField,
  IFlatCustomField,
} from 'services/formCustomFields';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';

const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const FormEdit = () => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomField | undefined
  >(undefined);
  const { projectId } = useParams() as { projectId: string };

  const { formCustomFields, setFormCustomFields } = useFormCustomFields({
    projectId,
  });

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
    if (!isNilOrError(formCustomFields)) {
      const newFields = clone(formCustomFields);
      const [removed] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, removed);
      setFormCustomFields(newFields);
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
        <FormBuilderTopBar formCustomFields={formCustomFields} />
        <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
          <FormBuilderToolbox onAddField={onAddField} />
          <StyledRightColumn>
            <Box width="1000px" bgColor="white" minHeight="300px">
              {!isNilOrError(formCustomFields) && (
                <FormFields
                  onEditField={setSelectedField}
                  formCustomFields={formCustomFields}
                  handleDragRow={handleDragRow}
                  handleDropRow={handleDropRow}
                  selectedFieldId={selectedField?.id}
                />
              )}
            </Box>
          </StyledRightColumn>
          <FormBuilderSettings
            key={selectedField ? selectedField.id : 'no-field-selected'}
            field={selectedField}
            onDelete={handleDelete}
            onFieldChange={onFieldChange}
            onClose={closeSettings}
          />
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
