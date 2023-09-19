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
import FormBuilderTopBar from 'components/FormBuilder/components/FormBuilderTopBar';
import FormBuilderToolbox from 'components/FormBuilder/components/FormBuilderToolbox';
import FormBuilderSettings from 'components/FormBuilder/components/FormBuilderSettings';
import FormFields from 'components/FormBuilder/components/FormFields';
import Error from 'components/UI/Error';
import Feedback from 'components/HookForm/Feedback';

// utils
import { isNilOrError } from 'utils/helperUtils';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';
import validateElementTitle from 'utils/yup/validateElementTitle';
import validateLogic from 'utils/yup/validateLogic';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import {
  NestedGroupingStructure,
  getReorderedFields,
  DragAndDropResult,
} from './utils';

// services
import { updateFormCustomFields } from 'services/formCustomFields';

// hooks
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';

// intl
import { WrappedComponentProps } from 'react-intl';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { FormBuilderConfig } from '../utils';
import HelmetIntl from 'components/HelmetIntl';
import {
  IFlatCreateCustomField,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';
import { isNewCustomFieldObject } from 'api/custom_fields/util';

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
  builderConfig: FormBuilderConfig;
} & WrappedComponentProps;

export const FormEdit = ({
  intl: { formatMessage },
  defaultValues,
  phaseId,
  projectId,
  totalSubmissions,
  builderConfig,
}: FormEditProps) => {
  const [selectedField, setSelectedField] = useState<
    IFlatCustomFieldWithIndex | undefined
  >(undefined);
  const {
    groupingType,
    isEditPermittedAfterSubmissions,
    formSavedSuccessMessage,
    isFormPhaseSpecific,
  } = builderConfig;

  const isEditingDisabled =
    totalSubmissions > 0 && !isEditPermittedAfterSubmissions;
  const showWarningNotice = totalSubmissions > 0;

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

    // When the first group is deleted, it's questions go to the next group
    if (fieldIndex === 0 && field.input_type === groupingType) {
      const nextGroupIndex = fields.findIndex(
        (field, fieldIndex) =>
          field.input_type === groupingType && fieldIndex !== 0
      );
      move(nextGroupIndex, 0);
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
        key: field.key,
        code: field.code,
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
      await updateFormCustomFields(
        projectId,
        finalResponseArray,
        isFormPhaseSpecific ? phaseId : undefined
      );
    } catch (error) {
      handleHookFormSubmissionError(error, setError, 'customFields');
    }
  };

  // Group is only deletable when we have more than one group
  const isGroupDeletable =
    fields.filter((field) => field.input_type === groupingType).length > 1;
  const isDeleteDisabled = !(
    selectedField?.input_type !== groupingType || isGroupDeletable
  );

  const reorderFields = (
    result: DragAndDropResult,
    nestedGroupData: NestedGroupingStructure[]
  ) => {
    const reorderedFields = getReorderedFields(result, nestedGroupData);
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

  if (!isNilOrError(builderConfig)) {
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
        <HelmetIntl title={messages.helmetTitle} />
        <FocusOn>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <FormBuilderTopBar
                isSubmitting={isSubmitting}
                isEditingDisabled={isEditingDisabled}
                builderConfig={builderConfig}
              />
              <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
                <FormBuilderToolbox
                  onAddField={onAddField}
                  isEditingDisabled={isEditingDisabled}
                  builderConfig={builderConfig}
                  move={move}
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
                      successMessage={formatMessage(formSavedSuccessMessage)}
                    />
                    {isEditingDisabled &&
                      builderConfig.getDeletionNotice &&
                      builderConfig.getDeletionNotice(projectId)}
                    {showWarningNotice &&
                      builderConfig.getWarningNotice &&
                      builderConfig.getWarningNotice()}
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
                        builderConfig={builderConfig}
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
                    builderConfig={builderConfig}
                  />
                )}
              </Box>
            </form>
          </FormProvider>
        </FocusOn>
      </Box>
    );
  }

  return null;
};

type FormBuilderPageProps = {
  builderConfig: FormBuilderConfig;
};
const FormBuilderPage = ({ builderConfig }: FormBuilderPageProps) => {
  const intl = useIntl();
  const modalPortalElement = document.getElementById('modal-portal');
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: submissionCount } = useFormSubmissionCount({
    projectId,
    phaseId,
  });

  const formCustomFields = builderConfig.formCustomFields;

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
          totalSubmissions={submissionCount.data.attributes.totalSubmissions}
          builderConfig={builderConfig}
        />,
        modalPortalElement
      )
    : null;
};

export default FormBuilderPage;
