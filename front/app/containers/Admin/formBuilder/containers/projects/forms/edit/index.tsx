import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { array, boolean, number, object, string } from 'yup';

// styles
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Feedback from 'components/HookForm/Feedback';
import Error from 'components/UI/Error';
import { RightColumn } from 'containers/Admin';
import FormBuilderSettings from 'containers/Admin/formBuilder/components/FormBuilderSettings';
import FormBuilderToolbox from 'containers/Admin/formBuilder/components/FormBuilderToolbox';
import FormBuilderTopBar from 'containers/Admin/formBuilder/components/FormBuilderTopBar';
import FormFields from 'containers/Admin/formBuilder/components/FormFields';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';

import {
  IFlatCreateCustomField,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  updateFormCustomFields,
} from 'services/formCustomFields';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';

// intl
import { injectIntl, WrappedComponentProps } from 'react-intl';
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

interface FormValues {
  customFields: IFlatCustomField[];
}

type FormEditProps = {
  defaultValues: {
    customFields: IFlatCustomField[];
  };
  projectId: string;
  phaseId?: string;
} & WrappedComponentProps;

export const FormEdit = ({
  intl: { formatMessage },
  defaultValues,
  phaseId,
  projectId,
}: FormEditProps) => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomFieldWithIndex | undefined
  >(undefined);

  const schema = object().shape({
    customFields: array().of(
      object().shape({
        title_multiloc: validateAtLeastOneLocale(
          formatMessage(messages.emptyTitleError)
        ),
        description_multiloc: object(),
        input_type: string(),
        options: validateOneOptionForMultiSelect(
          formatMessage(messages.emptyOptionError)
        ),
        maximum: number(),
        minimum_label_multiloc: object(),
        maximum_label_multiloc: object(),
        required: boolean(),
      })
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const {
    setError,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append, remove, move } = useFieldArray({
    name: 'customFields',
    control,
  });

  const closeSettings = () => {
    setSelectedField(undefined);
  };

  const handleDelete = (fieldIndex: number) => {
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

  const hasErrors = !!Object.keys(errors).length;

  const onFormSubmit = async ({ customFields }: FormValues) => {
    try {
      const finalResponseArray = customFields.map((field) => ({
        ...(!field.isLocalOnly && { id: field.id }),
        input_type: field.input_type,
        required: field.required,
        enabled: field.enabled,
        title_multiloc: field.title_multiloc || {},
        description_multiloc: field.description_multiloc || {},
        ...(field.input_type === 'multiselect' && {
          // TODO: This will get messy with more field types, abstract this in some way
          options: field.options || {},
        }),
        ...(field.input_type === 'linear_scale' && {
          minimum_label_multiloc: field.minimum_label_multiloc || {},
          maximum_label_multiloc: field.maximum_label_multiloc || {},
          maximum: field.maximum.toString(),
        }),
      }));

      await updateFormCustomFields(projectId, finalResponseArray, phaseId);
    } catch (error) {
      handleHookFormSubmissionError(error, setError, 'customFields');
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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <FormBuilderTopBar isSubmitting={isSubmitting} />
            <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
              <FormBuilderToolbox onAddField={onAddField} />
              <StyledRightColumn>
                <Box width="1000px">
                  {hasErrors && (
                    <Box mb="16px">
                      <Error
                        marginTop="8px"
                        marginBottom="8px"
                        text={formatMessage(messages.errorMessage)}
                        scrollIntoView={false}
                      />
                    </Box>
                  )}
                  <Feedback />
                  <Box bgColor="white" minHeight="300px">
                    <FormFields
                      onEditField={setSelectedField}
                      handleDragRow={handleDragRow}
                      selectedFieldId={selectedField?.id}
                    />
                  </Box>
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
          </form>
        </FormProvider>
      </FocusOn>
    </Box>
  );
};

const FormBuilderPage = ({ intl }) => {
  const modalPortalElement = document.getElementById('modal-portal');
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
  });

  if (isNilOrError(formCustomFields)) return null;

  return modalPortalElement
    ? createPortal(
        <FormEdit
          intl={intl}
          defaultValues={{ customFields: formCustomFields }}
          phaseId={phaseId}
          projectId={projectId}
        />,
        modalPortalElement
      )
    : null;
};

export default injectIntl(FormBuilderPage);
