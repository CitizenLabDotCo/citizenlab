import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { object, boolean, array } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

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
import { isNilOrError } from 'utils/helperUtils';
import validateMultiloc from 'utils/yup/validateMultiloc';

import {
  IFlatCreateCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';
import usePrevious from 'hooks/usePrevious';

// intl
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const FormEdit = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomFieldWithIndex | undefined
  >(undefined);
  const { projectId } = useParams() as { projectId: string };

  const { formCustomFields } = useFormCustomFields({
    projectId,
  });

  const prevFormCustomFields = usePrevious(formCustomFields);

  const schema = object().shape({
    customFields: array().of(
      object().shape({
        title_multiloc: validateMultiloc(
          formatMessage(messages.emptyTitleError)
        ),
        description_multiloc: object(),
        required: boolean(),
      })
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const { fields, append, remove, move } = useFieldArray({
    name: 'customFields',
    control: methods.control,
  });

  useEffect(() => {
    if (
      !isNilOrError(formCustomFields) &&
      (prevFormCustomFields || []).length !== formCustomFields.length
    ) {
      formCustomFields.forEach((field) => {
        append(field);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formCustomFields]);

  const closeSettings = () => {
    setSelectedField(undefined);
  };

  const handleDelete = async (fieldIndex: number) => {
    remove(fieldIndex);
    closeSettings();
  };

  // TODO: Improve this to remove usage of type casting
  const onAddField = (field: IFlatCreateCustomField) => {
    const newField = {
      ...field,
      index: !isNilOrError(fields) ? fields.length : 0,
    };
    append(newField);
    setSelectedField(newField as IFlatCustomFieldWithIndex);
  };

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
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
        <FormProvider {...methods}>
          <FormBuilderTopBar control={methods.control} />
          <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
            <FormBuilderToolbox onAddField={onAddField} />
            <StyledRightColumn>
              <Box width="1000px" bgColor="white" minHeight="300px">
                {!isNilOrError(formCustomFields) && (
                  <FormFields
                    onEditField={setSelectedField}
                    handleDragRow={handleDragRow}
                    selectedFieldId={selectedField?.id}
                    control={methods.control}
                  />
                )}
              </Box>
            </StyledRightColumn>
            {!isNilOrError(selectedField) && (
              <FormBuilderSettings
                key={selectedField.id}
                field={selectedField}
                onDelete={handleDelete}
                onClose={closeSettings}
              />
            )}
          </Box>
        </FormProvider>
      </FocusOn>
    </Box>
  );
};

const FormBuilderPage = ({ intl }) => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<FormEdit intl={intl} />, modalPortalElement)
    : null;
};

export default injectIntl(FormBuilderPage);
