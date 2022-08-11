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
import SurveyBuilderTopBar from 'modules/free/native_surveys/admin/components/SurveyBuilderTopBar';
import SurveyBuilderToolbox from 'modules/free/native_surveys/admin/components/SurveyBuilderToolbox';
import SurveyBuilderSettings from 'modules/free/native_surveys/admin/components/SurveyBuilderSettings';
import SurveyFields from 'modules/free/native_surveys/admin/components/SurveyFields';

// hooks
import useSurveyCustomFields from 'modules/free/native_surveys/hooks/useSurveyCustomFields';

// utils
import { isNilOrError, isNil } from 'utils/helperUtils';

import {
  IFlatCreateCustomField,
  IFlatCustomField,
} from 'modules/free/native_surveys/services/surveyCustomFields';

const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const SurveyEdit = () => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomField | undefined
  >(undefined);
  const { projectId } = useParams() as { projectId: string };

  const { surveyCustomFields, setSurveyCustomFields } = useSurveyCustomFields({
    projectId,
  });

  const closeSettings = () => {
    setSelectedField(undefined);
  };

  const handleDelete = async (fieldId: string) => {
    if (!isNilOrError(surveyCustomFields)) {
      const newFields = surveyCustomFields.filter(
        (field) => field.id !== fieldId
      );
      setSurveyCustomFields(newFields);
      closeSettings();
    }
  };

  // TODO: Improve this to remove usage of type casting
  const onAddField = (field: IFlatCreateCustomField) => {
    if (!isNilOrError(surveyCustomFields)) {
      setSurveyCustomFields(
        surveyCustomFields.concat([field as IFlatCustomField])
      );
    } else if (isNil(surveyCustomFields)) {
      setSurveyCustomFields([field as IFlatCustomField]);
    }
    setSelectedField(field as IFlatCustomField);
  };

  const onFieldChange = (fieldToUpdate: IFlatCustomField) => {
    if (!isNilOrError(surveyCustomFields)) {
      setSurveyCustomFields(
        surveyCustomFields.map((field) => {
          return field.id === fieldToUpdate.id ? fieldToUpdate : field;
        })
      );
    }
  };

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    if (!isNilOrError(surveyCustomFields)) {
      const newFields = clone(surveyCustomFields);
      const [removed] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, removed);
      setSurveyCustomFields(newFields);
    }
  };

  const handleDropRow = (fieldId: string, toIndex: number) => {
    if (!isNilOrError(surveyCustomFields)) {
      const newFields = clone(surveyCustomFields);
      const [removed] = newFields.splice(
        newFields.findIndex((field) => field.id === fieldId),
        1
      );
      newFields.splice(toIndex, 0, removed);
      setSurveyCustomFields(newFields);
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
        <SurveyBuilderTopBar surveyCustomFields={surveyCustomFields} />
        <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
          <SurveyBuilderToolbox onAddField={onAddField} />
          <StyledRightColumn>
            <Box width="1000px" bgColor="white" minHeight="300px">
              {!isNilOrError(surveyCustomFields) && (
                <SurveyFields
                  onEditField={setSelectedField}
                  surveyCustomFields={surveyCustomFields}
                  handleDragRow={handleDragRow}
                  handleDropRow={handleDropRow}
                />
              )}
            </Box>
          </StyledRightColumn>
          <SurveyBuilderSettings
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

const SurveyBuilderPage = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<SurveyEdit />, modalPortalElement)
    : null;
};

export default SurveyBuilderPage;
