import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams } from 'react-router-dom';

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
import { isNilOrError } from 'utils/helperUtils';

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

  const onAddField = (field: IFlatCreateCustomField) => {
    if (!isNilOrError(surveyCustomFields)) {
      setSurveyCustomFields(
        surveyCustomFields.concat([field as IFlatCustomField])
      );
    } else {
      setSurveyCustomFields([field as IFlatCustomField]);
    }
  };

  const onFieldChange = (field: IFlatCustomField) => {
    if (!isNilOrError(surveyCustomFields)) {
      setSurveyCustomFields(
        surveyCustomFields.map((f) => {
          if (f.id === field.id) {
            return field;
          }
          return f;
        })
      );
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
            <Box width="1000px" bgColor="#ffffff" minHeight="300px">
              {!isNilOrError(surveyCustomFields) && (
                <SurveyFields
                  onEditField={setSelectedField}
                  surveyCustomFields={surveyCustomFields}
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
