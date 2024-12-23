import React, { useEffect, useState } from 'react';

import {
  Box,
  Spinner,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';
import { object, boolean, array, string, number } from 'yup';

import {
  IFlatCreateCustomField,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useUpdateCustomField from 'api/custom_fields/useUpdateCustomFields';
import { isNewCustomFieldObject } from 'api/custom_fields/util';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';

import FormBuilderSettings from 'components/FormBuilder/components/FormBuilderSettings';
import FormBuilderToolbox from 'components/FormBuilder/components/FormBuilderToolbox';
import FormBuilderTopBar from 'components/FormBuilder/components/FormBuilderTopBar';
import FormFields from 'components/FormBuilder/components/FormFields';
import HelmetIntl from 'components/HelmetIntl';
import Feedback from 'components/HookForm/Feedback';
import SuccessFeedback from 'components/HookForm/Feedback/SuccessFeedback';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import validateElementTitle from 'utils/yup/validateElementTitle';
import validateLogic from 'utils/yup/validateLogic';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';

import messages from '../messages';
import { FormBuilderConfig } from '../utils';

import {
  NestedGroupingStructure,
  getReorderedFields,
  DragAndDropResult,
} from './utils';

interface FormValues {
  customFields: IFlatCustomField[];
}

type FormEditProps = {
  defaultValues: {
    customFields: IFlatCustomField[];
  };
  projectId: string;
  phaseId?: string;
  builderConfig: FormBuilderConfig;
  totalSubmissions: number;
  viewFormLink: RouteType;
};

const FormEdit = ({
  defaultValues,
  phaseId,
  projectId,
  builderConfig,
  totalSubmissions,
  viewFormLink,
}: FormEditProps) => {
  const { formatMessage } = useIntl();
  const [selectedField, setSelectedField] = useState<
    IFlatCustomFieldWithIndex | undefined
  >(undefined);
  const [successMessageIsVisible, setSuccessMessageIsVisible] = useState(false);
  const [accessRightsMessageIsVisible, setAccessRightsMessageIsVisible] =
    useState(true);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const { formSavedSuccessMessage, isFormPhaseSpecific } = builderConfig;
  const { mutateAsync: updateFormCustomFields } = useUpdateCustomField();
  const showWarningNotice = totalSubmissions > 0;
  const { data: formCustomFields, isFetching } = useFormCustomFields({
    projectId,
    phaseId: isFormPhaseSpecific ? phaseId : undefined,
  });

  const schema = object().shape({
    customFields: array().of(
      object().shape({
        title_multiloc: validateElementTitle(
          formatMessage(messages.emptyTitleError)
        ),
        description_multiloc: object(),
        input_type: string(),
        options: validateOneOptionForMultiSelect(
          formatMessage(messages.emptyOptionError),
          formatMessage(messages.emptyTitleMessage),
          { multiselect_image: formatMessage(messages.emptyImageOptionError) }
        ),
        maximum: number(),
        linear_scale_label_1_multiloc: object(),
        linear_scale_label_2_multiloc: object(),
        linear_scale_label_3_multiloc: object(),
        linear_scale_label_4_multiloc: object(),
        linear_scale_label_5_multiloc: object(),
        linear_scale_label_6_multiloc: object(),
        linear_scale_label_7_multiloc: object(),
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
    formState: { errors, isDirty },
    getValues,
    reset,
  } = methods;

  const { append, move, replace } = useFieldArray({
    name: 'customFields',
    control,
  });

  // This tracks form update. We isolate it to avoid setting data on other changes
  const [isUpdatingForm, setIsUpdatingForm] = useState(false);
  // This tracks form submission and update status
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdatingForm && !isFetching) {
      reset({ customFields: formCustomFields });
      setIsUpdatingForm(false);
      setIsSubmitting(false);
    }
  }, [formCustomFields, isUpdatingForm, isFetching, reset]);

  // const formOpenedAt = new Date(); // Used to log when the form was opened vs when it was saved
  let autosave: boolean = false; // Use to log autosave vs manual save
  const closeSettings = (triggerAutosave?: boolean) => {
    setSelectedField(undefined);

    // If autosave is enabled, no submission have come in yet and there are changes, save
    if (
      triggerAutosave &&
      autosaveEnabled &&
      totalSubmissions === 0 &&
      isDirty
    ) {
      autosave = true;
      onFormSubmit(getValues()).then(() => {
        autosave = false;
      });
    }
  };

  // Remove copy_from param on save to avoid overwriting a saved survey when reloading
  const [searchParams, setSearchParams] = useSearchParams();
  const resetCopyFrom = () => {
    if (searchParams.has('copy_from')) {
      searchParams.delete('copy_from');
      setSearchParams(searchParams);
    }
  };

  const onAddField = (field: IFlatCreateCustomField, index: number) => {
    const newField = {
      ...field,
      index,
    };

    if (isNewCustomFieldObject(newField)) {
      append(newField);
      setSelectedField(newField);
    }
  };

  const hasErrors = !!Object.keys(errors).length;
  const editedAndCorrect = !isSubmitting && isDirty && !hasErrors;

  const onFormSubmit = async ({ customFields }: FormValues) => {
    setSuccessMessageIsVisible(false);
    try {
      setIsSubmitting(true);
      const finalResponseArray = customFields.map((field) => ({
        ...(!field.isLocalOnly && { id: field.id }),
        input_type: field.input_type,
        ...(field.input_type === 'page' && {
          temp_id: field.temp_id,
        }),
        ...(['linear_scale', 'select', 'page'].includes(field.input_type)
          ? {
              logic: field.logic,
            }
          : {
              logic: [],
            }),
        required: field.required,
        enabled: field.enabled,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        title_multiloc: field.title_multiloc || {},
        key: field.key,
        code: field.code,
        ...(field.page_layout || field.input_type === 'page'
          ? { page_layout: field.page_layout || 'default' }
          : {}),
        ...(field.map_config_id && {
          map_config_id: field.map_config_id,
        }),
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        description_multiloc: field.description_multiloc || {},
        ...(['select', 'multiselect', 'multiselect_image'].includes(
          field.input_type
        ) && {
          // TODO: This will get messy with more field types, abstract this in some way
          options: field.options || {},
          maximum_select_count: field.select_count_enabled
            ? field.maximum_select_count
            : null,
          minimum_select_count: field.select_count_enabled
            ? field.minimum_select_count || '0'
            : null,
          select_count_enabled: field.select_count_enabled,
          random_option_ordering: field.random_option_ordering,
          dropdown_layout: field.dropdown_layout,
        }),
        ...(field.input_type === 'linear_scale' && {
          linear_scale_label_1_multiloc:
            field.linear_scale_label_1_multiloc || {},
          linear_scale_label_2_multiloc:
            field.linear_scale_label_2_multiloc || {},
          linear_scale_label_3_multiloc:
            field.linear_scale_label_3_multiloc || {},
          linear_scale_label_4_multiloc:
            field.linear_scale_label_4_multiloc || {},
          linear_scale_label_5_multiloc:
            field.linear_scale_label_5_multiloc || {},
          linear_scale_label_6_multiloc:
            field.linear_scale_label_6_multiloc || {},
          linear_scale_label_7_multiloc:
            field.linear_scale_label_7_multiloc || {},
          maximum: field.maximum?.toString() || '5',
        }),
      }));

      await updateFormCustomFields(
        {
          projectId,
          customFields: finalResponseArray,
          phaseId: isFormPhaseSpecific ? phaseId : undefined,
          customForm: {
            saveType: autosave ? 'auto' : 'manual',
            // openedAt: null, // TODO: JS - Placeholders until we get the actual values from the CustomForm object
            // lastUpdatedAt: null,
          },
        },
        {
          onSuccess: () => {
            setIsUpdatingForm(true);
            setSuccessMessageIsVisible(true);
            resetCopyFrom();
          },
        }
      );
    } catch (error) {
      handleHookFormSubmissionError(error, setError, 'customFields');
      setIsSubmitting(false);
    }
  };

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

  const closeSuccessMessage = () => setSuccessMessageIsVisible(false);
  const showSuccessMessage =
    successMessageIsVisible &&
    !editedAndCorrect &&
    Object.keys(errors).length === 0;

  const handleAccessRightsClose = () => setAccessRightsMessageIsVisible(false);

  const showWarnings = () => {
    if (editedAndCorrect) {
      return (
        <Box mb="8px">
          <Warning>{formatMessage(messages.unsavedChanges)}</Warning>
        </Box>
      );
    } else if (showWarningNotice && builderConfig.getWarningNotice) {
      return builderConfig.getWarningNotice();
    } else if (
      !hasErrors &&
      !successMessageIsVisible &&
      builderConfig.getAccessRightsNotice &&
      accessRightsMessageIsVisible
    ) {
      return builderConfig.getAccessRightsNotice(
        projectId,
        phaseId,
        handleAccessRightsClose
      );
    }
    return null;
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
      <HelmetIntl title={messages.helmetTitle} />
      <FocusOn>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <FormBuilderTopBar
              isSubmitting={isSubmitting}
              builderConfig={builderConfig}
              viewFormLink={viewFormLink}
              autosaveEnabled={autosaveEnabled}
              setAutosaveEnabled={setAutosaveEnabled}
              showAutosaveToggle={totalSubmissions === 0} // Only allow autosave if no survey submissions
            />
            <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
              <Box width="210px">
                <FormBuilderToolbox
                  onAddField={onAddField}
                  builderConfig={builderConfig}
                  move={move}
                />
              </Box>
              <Box
                flex="1.8"
                border="1px solid #ccc"
                overflowY="auto"
                zIndex="2"
                margin="0px"
                paddingBottom="100px"
                height={`calc(100vh - ${stylingConsts.menuHeight}px)`}
                px="30px"
              >
                <Box mt="16px">
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
                    onlyShowErrors
                  />
                  {showSuccessMessage && (
                    <SuccessFeedback
                      successMessage={formatMessage(formSavedSuccessMessage)}
                      closeSuccessMessage={closeSuccessMessage}
                    />
                  )}
                  {showWarnings()}
                  <Box
                    borderRadius="3px"
                    boxShadow="0px 2px 4px rgba(0, 0, 0, 0.2)"
                    bgColor="white"
                    minHeight="300px"
                  >
                    <FormFields
                      onEditField={setSelectedField}
                      selectedFieldId={selectedField?.id}
                      handleDragEnd={reorderFields}
                      builderConfig={builderConfig}
                      closeSettings={closeSettings}
                    />
                  </Box>
                </Box>
              </Box>
              <Box flex={!isNilOrError(selectedField) ? '1' : '0'}>
                {!isNilOrError(selectedField) && (
                  <Box>
                    <FormBuilderSettings
                      key={selectedField.id}
                      field={selectedField}
                      closeSettings={closeSettings}
                      builderConfig={builderConfig}
                      formHasSubmissions={totalSubmissions > 0}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </form>
        </FormProvider>
      </FocusOn>
    </Box>
  );
};

type FormBuilderPageProps = {
  builderConfig: FormBuilderConfig;
  viewFormLink: RouteType;
};

const FormBuilderPage = ({
  builderConfig,
  viewFormLink,
}: FormBuilderPageProps) => {
  const modalPortalElement = document.getElementById('modal-portal');
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  const formCustomFields = builderConfig.formCustomFields;

  if (isNilOrError(formCustomFields) || isNilOrError(submissionCount)) {
    return <Spinner />;
  }

  return modalPortalElement
    ? createPortal(
        <FormEdit
          defaultValues={{ customFields: formCustomFields }}
          phaseId={phaseId}
          projectId={projectId}
          builderConfig={builderConfig}
          totalSubmissions={submissionCount.data.attributes.totalSubmissions}
          viewFormLink={viewFormLink}
        />,
        modalPortalElement
      )
    : null;
};

export default FormBuilderPage;
