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
import DeleteFormResultsNotice from 'components/FormBuilder/components/DeleteFormResultsNotice';

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
  ICustomFieldInputType,
} from 'services/formCustomFields';

// hooks
// import useFormCustomFields from 'hooks/useFormCustomFields';
import useFormSubmissionCount from 'hooks/useFormSubmissionCount';

// intl
import { WrappedComponentProps } from 'react-intl';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { FormBuilderConfig } from '../utils';

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
  builderConfig?: FormBuilderConfig;
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
  // TODO: Once data is migrated + new form fields implemented, uncomment this.
  // const formCustomFields = useFormCustomFields({
  //   projectId,
  //   phaseId,
  // });
  const submissionCount = useFormSubmissionCount({
    projectId,
    phaseId,
  });

  // TODO: Remove later on.
  // Temporary formCustomFields with changed input_types + additional first page for ideation.
  // Survey editing breaks with this hardcoded value.
  const formCustomFields = [
    {
      id: 'f5f4d0bb-3059-4cc2-aadf-fc5eb828399d',
      type: 'custom_field',
      key: 'page_1',
      input_type: 'page' as ICustomFieldInputType,
      title_multiloc: {},
      required: false,
      ordering: 9,
      enabled: true,
      code: null,
      created_at: '2023-01-10T08:10:09.783Z',
      updated_at: '2023-01-10T08:10:09.783Z',
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: '5fa13807-86b8-4a62-904e-a0de5419d6ae',
      type: 'custom_field',
      key: 'title_multiloc',
      input_type: 'text' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Title',
        'ar-MA': 'العنوان',
        'ar-SA': 'العنوان',
        'ca-ES': 'Títol',
        'da-DK': 'Titel',
        'de-DE': 'Titel',
        'el-GR': 'Τίτλος',
        'en-CA': 'Title',
        'en-GB': 'Title',
        'es-CL': 'Título',
        'es-ES': 'Título',
        'fr-BE': 'Titre',
        'fr-FR': 'Titre',
        'hr-HR': 'Naslov',
        'hu-HU': 'Title',
        'it-IT': 'Titolo',
        'kl-GL': 'Atorfiup taaguutaa',
        'lb-LU': 'Titel',
        'lv-LV': 'Nosaukums',
        mi: 'Title',
        'nb-NO': 'Tittel',
        'nl-BE': 'Titel',
        'nl-NL': 'Titel',
        'pl-PL': 'Tytuł',
        'pt-BR': 'Assunto',
        'ro-RO': 'Titlu',
        'sr-Latn': 'Naslov',
        'sr-SP': 'Наслов',
        'sv-SE': 'Titel',
        'tr-TR': 'Başlık',
      },
      required: true,
      ordering: 0,
      enabled: true,
      code: 'title_multiloc',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: '5b9940a4-ba83-40da-9a2d-51287f38411a',
      type: 'custom_field',
      key: 'body_multiloc',
      input_type: 'text' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Description',
        'ar-MA': 'الوصف',
        'ar-SA': 'الوصف',
        'ca-ES': 'Descripció',
        'da-DK': 'Beskrivelse',
        'de-DE': 'Beschreibung',
        'el-GR': 'Περιγραφή',
        'en-CA': 'Description',
        'en-GB': 'Description',
        'es-CL': 'Descripción',
        'es-ES': 'Descripción',
        'fr-BE': 'Description complète',
        'fr-FR': 'Description',
        'hr-HR': 'Opis',
        'hu-HU': 'Description',
        'it-IT': 'Descrizione',
        'kl-GL': 'Nassuiaat',
        'lb-LU': 'Beschreiwung',
        'lv-LV': 'Apraksts',
        mi: 'Description',
        'nb-NO': 'Beskrivelse',
        'nl-BE': 'Beschrijving',
        'nl-NL': 'Beschrijving',
        'pl-PL': 'Opis',
        'pt-BR': 'Descrição',
        'ro-RO': 'Descriere',
        'sr-Latn': 'Opis',
        'sr-SP': 'Опис',
        'sv-SE': 'Beskrivning',
        'tr-TR': 'Açıklama',
      },
      required: true,
      ordering: 1,
      enabled: true,
      code: 'body_multiloc',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: 'f7959714-bf96-4537-8d51-e7686e2dc699',
      type: 'custom_field',
      key: 'proposed_budget',
      input_type: 'number' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Proposed Budget',
        'ar-MA': 'الميزانية المُقترحة',
        'ar-SA': 'الميزانية المُقترحة',
        'ca-ES': 'Proposed Budget',
        'da-DK': 'Estimeret Budget',
        'de-DE': 'Vorgeschlagenes Budget',
        'el-GR': 'Proposed Budget',
        'en-CA': 'Proposed Budget',
        'en-GB': 'Proposed Budget',
        'es-CL': 'Proyecto de presupuesto',
        'es-ES': 'Proyecto de presupuesto',
        'fr-BE': 'Proposition de budget',
        'fr-FR': 'Proposition de budget',
        'hr-HR': 'Predloženi proračun',
        'hu-HU': 'Proposed Budget',
        'it-IT': 'Bilancio proposto',
        'kl-GL': 'Proposed Budget',
        'lb-LU': 'Proposéierte Budget',
        'lv-LV': 'Ierosinātais budžets',
        mi: 'Proposed Budget',
        'nb-NO': 'Proposed Budget',
        'nl-BE': 'Voorgesteld budget',
        'nl-NL': 'Voorgesteld budget',
        'pl-PL': 'Proponowany budżet',
        'pt-BR': 'Orçamento proposto',
        'ro-RO': 'Buget propus',
        'sr-Latn': 'Predloženi budžet',
        'sr-SP': 'Предложени буџет',
        'sv-SE': 'Budgetförslag',
        'tr-TR': 'Öngörülen Bütçe',
      },
      required: false,
      ordering: 4,
      enabled: false,
      code: 'proposed_budget',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: 'f805c9cf-f47a-4da8-ba14-faf57610fff0',
      type: 'custom_field',
      key: 'topic_ids',
      input_type: 'select' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Tags',
        'ar-MA': 'الموضوعات',
        'ar-SA': 'الموضوعات',
        'ca-ES': 'Etiquetes',
        'da-DK': 'Emner',
        'de-DE': 'Themen',
        'el-GR': 'Ετικέτες',
        'en-CA': 'Tags',
        'en-GB': 'Tags',
        'es-CL': 'Temas',
        'es-ES': 'Temas',
        'fr-BE': 'Étiquettes',
        'fr-FR': 'Étiquettes',
        'hr-HR': 'Oznake',
        'hu-HU': 'Topics',
        'it-IT': 'Argomenti',
        'kl-GL': 'Pineqartut',
        'lb-LU': 'Sujeten',
        'lv-LV': 'Tagi',
        mi: 'Topics',
        'nb-NO': 'Emner',
        'nl-BE': 'Tags',
        'nl-NL': 'Tags',
        'pl-PL': 'Tematy',
        'pt-BR': 'Tópicos',
        'ro-RO': 'Subiecte',
        'sr-Latn': 'Tema',
        'sr-SP': 'Теме',
        'sv-SE': 'Topics',
        'tr-TR': 'Etiketler',
      },
      required: false,
      ordering: 5,
      enabled: true,
      code: 'topic_ids',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: 'b860287f-d9e9-4684-bcfb-e70f53045493',
      type: 'custom_field',
      key: 'location_description',
      input_type: 'text' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Location',
        'ar-MA': 'الموقع',
        'ar-SA': 'الموقع',
        'ca-ES': 'Ubicació',
        'da-DK': 'Beliggenhed',
        'de-DE': 'Standort',
        'el-GR': 'Τοποθεσία',
        'en-CA': 'Location',
        'en-GB': 'Location',
        'es-CL': 'Ubicación',
        'es-ES': 'Ubicación',
        'fr-BE': 'Adresse',
        'fr-FR': 'Adresse',
        'hr-HR': 'Lokacija',
        'hu-HU': 'Location',
        'it-IT': 'Posizione',
        'kl-GL': 'Sumi',
        'lb-LU': 'Standuert',
        'lv-LV': 'Atrašanās vieta',
        mi: 'Location',
        'nb-NO': 'Lokalitet',
        'nl-BE': 'Locatie',
        'nl-NL': 'Locatie',
        'pl-PL': 'Lokalizacja',
        'pt-BR': 'Localização',
        'ro-RO': 'Locație',
        'sr-Latn': 'Lokacija',
        'sr-SP': 'Локација',
        'sv-SE': 'Plats',
        'tr-TR': 'Konum',
      },
      required: false,
      ordering: 6,
      enabled: true,
      code: 'location_description',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: '66136efe-5e07-4050-9b75-452ef9e79e10',
      type: 'custom_field',
      key: 'idea_images_attributes',
      input_type: 'text' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Images',
        'ar-MA': 'الصور',
        'ar-SA': 'الصور',
        'ca-ES': 'Images',
        'da-DK': 'Billeder',
        'de-DE': 'Bilder',
        'el-GR': 'Images',
        'en-CA': 'Images',
        'en-GB': 'Images',
        'es-CL': 'Imágenes',
        'es-ES': 'Imágenes',
        'fr-BE': 'Images',
        'fr-FR': 'Images',
        'hr-HR': 'Slike',
        'hu-HU': 'Images',
        'it-IT': 'Immagini',
        'kl-GL': 'Assit',
        'lb-LU': 'Biller',
        'lv-LV': 'Attēli',
        mi: 'Images',
        'nb-NO': 'Bilder',
        'nl-BE': 'Afbeeldingen',
        'nl-NL': 'Afbeeldingen',
        'pl-PL': 'Zdjęcia',
        'pt-BR': 'Imagens',
        'ro-RO': 'Imagini',
        'sr-Latn': 'Slike',
        'sr-SP': 'Слике',
        'sv-SE': 'Bilder',
        'tr-TR': 'Görseller',
      },
      required: false,
      ordering: 7,
      enabled: true,
      code: 'idea_images_attributes',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
    {
      id: '3f202dcf-288a-4fd4-8f3f-e9c63ffde804',
      type: 'custom_field',
      key: 'idea_files_attributes',
      input_type: 'text' as ICustomFieldInputType,
      title_multiloc: {
        en: 'Attachments',
        'ar-MA': 'المُرفقات',
        'ar-SA': 'المُرفقات',
        'ca-ES': 'Adjunts',
        'da-DK': 'Vedhæftede filer',
        'de-DE': 'Anhänge',
        'el-GR': 'Συνημμένα αρχεία',
        'en-CA': 'Other files',
        'en-GB': 'Other files',
        'es-CL': 'Archivos adjuntos',
        'es-ES': 'Archivos adjuntos',
        'fr-BE': 'Pièces jointes',
        'fr-FR': 'Pièces jointes',
        'hr-HR': 'Privici',
        'hu-HU': 'Other files',
        'it-IT': 'Allegati',
        'kl-GL': 'Filit ilanngussat',
        'lb-LU': 'Annexen',
        'lv-LV': 'Pielikumi',
        mi: 'Attachments',
        'nb-NO': 'Vedlegg',
        'nl-BE': 'Bijlagen',
        'nl-NL': 'Bijlagen',
        'pl-PL': 'Załączniki',
        'pt-BR': 'Anexos',
        'ro-RO': 'Fișiere atașate',
        'sr-Latn': 'Prilozi',
        'sr-SP': 'Прилози',
        'sv-SE': 'Bilagor',
        'tr-TR': 'Ekler',
      },
      required: false,
      ordering: 8,
      enabled: true,
      code: 'idea_files_attributes',
      created_at: null,
      updated_at: null,
      logic: {},
      description_multiloc: {},
      relationships: {
        options: {
          data: [],
        },
      },
    },
  ];

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
          builderConfig={builderConfig}
        />,
        modalPortalElement
      )
    : null;
};

export default FormBuilderPage;
