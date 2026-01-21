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

import {
  IFlatCreateCustomField,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  ICustomFieldInputType,
} from 'api/custom_fields/types';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useUpdateCustomField from 'api/custom_fields/useUpdateCustomFields';
import { isNewCustomFieldObject } from 'api/custom_fields/util';
import useCustomForm from 'api/custom_form/useCustomForm';
import { IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useSubmissionsCount from 'api/submission_count/useSubmissionCount';

import useLocale from 'hooks/useLocale';

import FormBuilderSettings from 'components/FormBuilder/components/FormBuilderSettings';
import FormBuilderToolbox from 'components/FormBuilder/components/FormBuilderToolbox';
import FormBuilderTopBar from 'components/FormBuilder/components/FormBuilderTopBar';
import FormFields from 'components/FormBuilder/components/FormFields';
import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import { DragAndDrop, Drop } from '../components/DragAndDrop';
import { pageDNDType } from '../components/FormFields/constants';
import FormStatus from '../components/FormStatus';
import messages from '../messages';
import { FormBuilderConfig } from '../utils';

import {
  getReorderedFields,
  DragAndDropResult,
  getNestedGroupData,
  createValidationSchema,
  createNewField,
  transformFieldForSubmission,
  calculateDropTargetIndex,
  handleBuiltInFieldEnablement,
} from './utils';

interface FormValues {
  customFields: IFlatCustomField[];
}

type FormEditProps = {
  defaultValues: {
    customFields: IFlatCustomField[];
  };
  builderConfig: FormBuilderConfig;
  totalSubmissions: number;
  viewFormLink: RouteType;
  phase: IPhaseData;
};

const FormEdit = ({
  defaultValues,
  builderConfig,
  totalSubmissions,
  viewFormLink,
  phase,
}: FormEditProps) => {
  const phaseId = phase.id;
  const projectId = phase.relationships.project.data.id;
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [selectedField, setSelectedField] = useState<
    IFlatCustomFieldWithIndex | undefined
  >(undefined);
  const [successMessageIsVisible, setSuccessMessageIsVisible] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const { isFormPhaseSpecific } = builderConfig;
  const { mutateAsync: updateFormCustomFields } = useUpdateCustomField();
  const { data: formCustomFields, isFetching } = useFormCustomFields({
    projectId,
    phaseId: isFormPhaseSpecific ? phaseId : undefined,
  });

  const { data: customForm } = useCustomForm(phase);

  // Set the form opened at date from the API date only when the form is first loaded
  const [formOpenedAt, setFormOpenedAt] = useState<string | undefined>();
  useEffect(() => {
    if (!formOpenedAt && customForm?.data.attributes.opened_at) {
      setFormOpenedAt(customForm.data.attributes.opened_at);
    }
  }, [formOpenedAt, customForm]);

  // Helper function to create new fields (extracted from toolbox logic)
  const createField = (type: ICustomFieldInputType) => {
    if (isNilOrError(locale)) return null;
    return createNewField(type, locale, formatMessage);
  };

  const schema = createValidationSchema(formatMessage);

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: defaultValues as any,
    resolver: yupResolver(schema),
  });

  const {
    setError,
    handleSubmit,
    control,
    formState: { isDirty },
    getValues,
    reset,
    trigger,
    watch,
    setValue,
  } = methods;

  const { move, replace, insert } = useFieldArray({
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
    if (!formCustomFields) return;

    const newField = {
      ...field,
      index,
    };

    if (isNewCustomFieldObject(newField)) {
      insert(index, newField);
      setSelectedField(newField);
    }
  };

  const onFormSubmit = async ({ customFields }: FormValues) => {
    setSuccessMessageIsVisible(false);
    try {
      setIsSubmitting(true);
      const finalResponseArray = customFields.map((field) =>
        transformFieldForSubmission(field, customFields)
      );

      await updateFormCustomFields(
        {
          projectId,
          customFields: finalResponseArray,
          phaseId: isFormPhaseSpecific ? phaseId : undefined,
          customForm: {
            saveType: autosave ? 'auto' : 'manual',
            openedAt: formOpenedAt,
            fieldsLastUpdatedAt:
              customForm?.data.attributes.fields_last_updated_at,
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
      const errorType =
        Array.isArray(error?.errors?.form) &&
        error.errors.form.length > 0 &&
        error.errors.form[0].error === 'stale_data'
          ? 'staleData'
          : 'customFields';
      handleHookFormSubmissionError(error, setError, errorType);
      setIsSubmitting(false);
    }
  };

  const reorderFields = (result: DragAndDropResult) => {
    const formCustomFields = watch('customFields');
    const nestedGroupData = getNestedGroupData(formCustomFields);

    // Handle toolbox drags (creating new fields or enabling built-in fields)
    if (result.draggableId.startsWith('toolbox_')) {
      // Extract field type/key from draggable ID
      const fieldTypeOrKey = result.draggableId.replace('toolbox_', '');

      // Check if this is a built-in field
      const builtInFieldKeys = builderConfig.builtInFields;
      const isBuiltInField = builtInFieldKeys.includes(fieldTypeOrKey as any);

      if (isBuiltInField) {
        // Handle built-in field enablement using utility function
        const enablementResult = handleBuiltInFieldEnablement(
          fieldTypeOrKey,
          formCustomFields,
          result,
          nestedGroupData,
          setValue,
          move
        );

        if (
          enablementResult.success &&
          enablementResult.updatedField &&
          enablementResult.targetIndex !== undefined
        ) {
          setSelectedField({
            ...enablementResult.updatedField,
            index: enablementResult.targetIndex,
          });
        }

        trigger();
        return;
      } else {
        // Handle regular custom field creation
        const inputType = fieldTypeOrKey as ICustomFieldInputType;
        const newField = createField(inputType);
        if (!newField) return;

        const targetIndex = calculateDropTargetIndex(
          result,
          formCustomFields,
          nestedGroupData
        );
        if (targetIndex !== null) {
          onAddField(newField, targetIndex);
        }
        return;
      }
    }

    // Handle regular reordering
    const reorderedFields = getReorderedFields(result, nestedGroupData);
    if (reorderedFields) {
      replace(reorderedFields);
    }

    if (selectedField && reorderedFields) {
      const newSelectedFieldIndex = reorderedFields.findIndex(
        (field) => field.id === selectedField.id
      );
      setSelectedField({ ...selectedField, index: newSelectedFieldIndex });
    }
    trigger();
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
      data-cy="e2e-survey-form-builder"
    >
      <HelmetIntl title={messages.helmetTitle} />
      <FocusOn>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit as any)}>
            <FormBuilderTopBar
              isSubmitting={isSubmitting}
              builderConfig={builderConfig}
              viewFormLink={viewFormLink}
              autosaveEnabled={autosaveEnabled}
              setAutosaveEnabled={setAutosaveEnabled}
              phaseId={phaseId}
              onFormSave={() => setIsUpdatingForm(true)}
            />
            <DragAndDrop onDragEnd={reorderFields}>
              <Drop id="droppable" type={pageDNDType}>
                <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
                  <Box width="210px">
                    <FormBuilderToolbox builderConfig={builderConfig} />
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
                      <FormStatus
                        successMessageIsVisible={successMessageIsVisible}
                        setSuccessMessageIsVisible={setSuccessMessageIsVisible}
                        isSubmitting={isSubmitting}
                        builderConfig={builderConfig}
                        projectId={projectId}
                        phaseId={phaseId}
                      />
                      <FormFields
                        onEditField={setSelectedField}
                        selectedFieldId={selectedField?.id}
                        handleDragEnd={reorderFields}
                        builderConfig={builderConfig}
                        closeSettings={closeSettings}
                      />
                    </Box>
                  </Box>
                  <Box flex={!isNilOrError(selectedField) ? '1' : '0'}>
                    {selectedField && (
                      <Box>
                        <FormBuilderSettings
                          key={selectedField.id}
                          field={selectedField}
                          closeSettings={closeSettings}
                          builderConfig={builderConfig}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Drop>
            </DragAndDrop>
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
  const { phaseId } = useParams();
  const { data: submissionCount } = useSubmissionsCount({
    phaseId,
  });
  const { data: phase } = usePhase(phaseId);

  const formCustomFields = builderConfig.formCustomFields;

  if (!phase) {
    return null;
  }

  if (isNilOrError(formCustomFields) || isNilOrError(submissionCount)) {
    return <Spinner />;
  }

  return modalPortalElement
    ? createPortal(
        <FormEdit
          defaultValues={{ customFields: formCustomFields }}
          phase={phase.data}
          builderConfig={builderConfig}
          totalSubmissions={submissionCount.data.attributes.totalSubmissions}
          viewFormLink={viewFormLink}
        />,
        modalPortalElement
      )
    : null;
};

export default FormBuilderPage;
