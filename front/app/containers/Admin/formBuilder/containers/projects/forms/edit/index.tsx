import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { object, boolean, array, string, number } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// styles
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import FormBuilderTopBar from 'containers/Admin/formBuilder/components/FormBuilderTopBar';
import FormBuilderToolbox from 'containers/Admin/formBuilder/components/FormBuilderToolbox';
import FormBuilderSettings from 'containers/Admin/formBuilder/components/FormBuilderSettings';
import FormFields from 'containers/Admin/formBuilder/components/FormFields';
import Error from 'components/UI/Error';
import Feedback from 'components/HookForm/Feedback';
import DeleteFormResultsNotice from 'containers/Admin/formBuilder/components/DeleteFormResultsNotice';

// utils
import { isNilOrError } from 'utils/helperUtils';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';
import validateElementTitle from 'utils/yup/validateElementTitle';
import validateLogic from 'utils/yup/validateLogic';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { PageStructure, getReorderedFields, DragAndDropResult } from './utils';

// services
import {
  IFlatCreateCustomField,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  updateFormCustomFields,
  isNewCustomFieldObject,
} from 'services/formCustomFields';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';
import useFormSubmissionCount from 'hooks/useFormSubmissionCount';

// intl
import { WrappedComponentProps } from 'react-intl';
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

interface FormValues {
  customFields: IFlatCustomField[];
}

type FormEditProps = {
  defaultValues: {
    customFields: IFlatCustomField[];
  };
  projectId: string;
  phaseId?: string;
  totalSubmissions: number;
} & WrappedComponentProps;

export const FormEdit = ({
  intl: { formatMessage },
  defaultValues,
  phaseId,
  projectId,
  totalSubmissions,
}: FormEditProps) => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomFieldWithIndex | undefined
  >(undefined);

  const isEditingDisabled = totalSubmissions > 0;

  const schema = object().shape({
    customFields: array().of(
      object().shape({
        title_multiloc: validateElementTitle(
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
        temp_id: string(),
        logic: validateLogic(formatMessage(messages.logicValidationError)),
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
    trigger,
  } = methods;

  const { fields, append, remove, move, replace } = useFieldArray({
    name: 'customFields',
    control,
  });

  const closeSettings = () => {
    setSelectedField(undefined);
  };

  const handleDelete = (fieldIndex: number) => {
    const field = fields[fieldIndex];

    // When the first page is deleted, it's questions go to the next page
    if (fieldIndex === 0 && field.input_type === 'page') {
      const nextPageIndex = fields.findIndex(
        (feild, fieldIndex) => feild.input_type === 'page' && fieldIndex !== 0
      );
      move(nextPageIndex, 0);
      remove(1);
    } else {
      remove(fieldIndex);
    }

    closeSettings();
    trigger();
  };

  const onAddField = (field: IFlatCreateCustomField) => {
    const newField = {
      ...field,
      index: !isNilOrError(fields) ? fields.length : 0,
    };

    if (isNewCustomFieldObject(newField)) {
      append(newField);
      setSelectedField(newField);
    }
  };

  const hasErrors = !!Object.keys(errors).length;

  const onFormSubmit = async ({ customFields }: FormValues) => {
    try {
      const finalResponseArray = customFields.map((field) => ({
        ...(!field.isLocalOnly && { id: field.id }),
        input_type: field.input_type,
        ...(field.input_type === 'page' && {
          temp_id: field.temp_id,
        }),
        ...(['linear_scale', 'select', 'page'].includes(field.input_type) && {
          logic: field.logic,
        }),
        required: field.required,
        enabled: field.enabled,
        title_multiloc: field.title_multiloc || {},
        description_multiloc: field.description_multiloc || {},
        ...((field.input_type === 'multiselect' ||
          field.input_type === 'select') && {
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

  // Page is only deletable when we have more than one page
  const isPageDeletable =
    fields.filter((field) => field.input_type === 'page').length > 1;
  const isDeleteDisabled = !(
    selectedField?.input_type !== 'page' || isPageDeletable
  );

  const reorderFields = (
    result: DragAndDropResult,
    nestedPageData: PageStructure[]
  ) => {
    const reorderedFields = getReorderedFields(result, nestedPageData);
    if (reorderedFields) {
      replace(reorderedFields);
    }

    if (!isNilOrError(selectedField) && reorderedFields) {
      const newSelectedFieldIndex = reorderedFields.findIndex(
        (field) => field.id === selectedField.id
      );
      setSelectedField({ ...selectedField, index: newSelectedFieldIndex });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.background}
      h="100vh"
    >
      <FocusOn>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <FormBuilderTopBar
              isSubmitting={isSubmitting}
              isEditingDisabled={isEditingDisabled}
            />
            <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
              <FormBuilderToolbox
                onAddField={onAddField}
                isEditingDisabled={isEditingDisabled}
              />
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
                  <Feedback
                    successMessage={formatMessage(messages.successMessage)}
                  />
                  {isEditingDisabled && (
                    <DeleteFormResultsNotice
                      projectId={projectId}
                      redirectToSurveyPage
                    />
                  )}
                  <Box
                    borderRadius="3px"
                    boxShadow="0px 2px 4px rgba(0, 0, 0, 0.2)"
                    bgColor="white"
                    minHeight="300px"
                  >
                    <FormFields
                      onEditField={setSelectedField}
                      selectedFieldId={selectedField?.id}
                      isEditingDisabled={isEditingDisabled}
                      handleDragEnd={reorderFields}
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
                  isDeleteDisabled={isDeleteDisabled}
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
  const submissionCount = useFormSubmissionCount({
    projectId,
    phaseId,
  });

  if (isNilOrError(formCustomFields) || isNilOrError(submissionCount)) {
    return <Spinner />;
  }

  return modalPortalElement
    ? createPortal(
        <FormEdit
          intl={intl}
          defaultValues={{ customFields: formCustomFields }}
          phaseId={phaseId}
          projectId={projectId}
          totalSubmissions={submissionCount.totalSubmissions}
        />,
        modalPortalElement
      )
    : null;
};

export default injectIntl(FormBuilderPage);
