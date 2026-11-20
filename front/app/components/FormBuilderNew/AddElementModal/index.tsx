import React, { useState } from 'react';

import {
  Box,
  CardButton,
  IconNames,
  Select,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import formBuilderMessages from 'components/FormBuilder/components/messages';
import { ResolvedFormBuilderConfig } from 'components/FormBuilder/utils';
import Modal from 'components/UI/Modal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { PageGroup, QuestionPosition, isFormEndPage } from '../utils';

type ElementOption = {
  inputType: ICustomFieldInputType;
  icon: IconNames;
  label: MessageDescriptor;
};

// Same elements, icons and labels as the toolbox of the current builder.
const QUESTION_ELEMENTS: ElementOption[] = [
  {
    inputType: 'text',
    icon: 'survey-short-answer-2',
    label: formBuilderMessages.shortAnswer,
  },
  {
    inputType: 'multiline_text',
    icon: 'survey-long-answer-2',
    label: formBuilderMessages.longAnswer,
  },
  {
    inputType: 'select',
    icon: 'survey-single-choice',
    label: formBuilderMessages.singleChoice,
  },
  {
    inputType: 'multiselect',
    icon: 'survey-multiple-choice-2',
    label: formBuilderMessages.multipleChoice,
  },
  {
    inputType: 'multiselect_image',
    icon: 'image',
    label: formBuilderMessages.multipleChoiceImage,
  },
  {
    inputType: 'linear_scale',
    icon: 'survey-linear-scale',
    label: formBuilderMessages.linearScale,
  },
  {
    inputType: 'ranking',
    icon: 'survey-ranking',
    label: formBuilderMessages.ranking,
  },
  { inputType: 'rating', icon: 'rating', label: formBuilderMessages.rating },
  {
    inputType: 'sentiment_linear_scale',
    icon: 'survey-sentiment',
    label: formBuilderMessages.sentiment,
  },
  {
    inputType: 'matrix_linear_scale',
    icon: 'survey-matrix',
    label: formBuilderMessages.matrix,
  },
  {
    inputType: 'number',
    icon: 'survey-number-field',
    label: formBuilderMessages.number,
  },
  {
    inputType: 'file_upload',
    icon: 'upload-file',
    label: formBuilderMessages.fileUpload,
  },
];

const MAPPING_ELEMENTS: ElementOption[] = [
  { inputType: 'point', icon: 'dropPin', label: formBuilderMessages.dropPin },
  {
    inputType: 'line',
    icon: 'drawRoute',
    label: formBuilderMessages.drawRoute,
  },
  {
    inputType: 'polygon',
    icon: 'drawPolygon',
    label: formBuilderMessages.drawArea,
  },
  {
    inputType: 'multipoint',
    icon: 'dropPin',
    label: formBuilderMessages.dropMultiplePins,
  },
  {
    inputType: 'shapefile_upload',
    icon: 'upload-file',
    label: formBuilderMessages.shapefileUpload,
  },
];

const truncate = (text: string, length = 40) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

type Props = {
  groups: PageGroup[];
  initialQuestionPosition: QuestionPosition;
  builderConfig: ResolvedFormBuilderConfig;
  onClose: () => void;
  onAddQuestion: (
    inputType: ICustomFieldInputType,
    position: QuestionPosition
  ) => void;
};

const AddElementModal = ({
  groups,
  initialQuestionPosition,
  builderConfig,
  onClose,
  onAddQuestion,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isFormMappingEnabled = useFeatureFlag({ name: 'form_mapping' });
  const [questionPosition, setQuestionPosition] = useState(
    initialQuestionPosition
  );

  // Questions can't go on the ending page and nothing comes after it.
  const editableGroups = groups.filter((group) => !isFormEndPage(group.page));

  const pageLabel = (group: PageGroup) => {
    const number = groups.indexOf(group) + 1;
    const title = localize(group.page.title_multiloc);
    const pageNumber = formatMessage(messages.pageNumber, { number });
    return title ? `${pageNumber}: ${truncate(title)}` : pageNumber;
  };

  const pageOptions = editableGroups.map((group) => ({
    value: group.page.id,
    label: pageLabel(group),
  }));

  const targetGroup = editableGroups.find(
    (group) => group.page.id === questionPosition.pageId
  );
  const positionOptions = [
    { value: '0', label: formatMessage(messages.atTopOfPage) },
    ...(targetGroup?.questions ?? []).map(({ field }, i) => ({
      value: `${i + 1}`,
      label: formatMessage(messages.afterQuestion, {
        title: truncate(
          localize(field.title_multiloc) ||
            formatMessage(messages.untitledQuestion),
          50
        ),
      }),
    })),
  ];

  const include = (element: ElementOption) =>
    builderConfig.toolboxFieldsToInclude.includes(element.inputType);
  const questionElements = QUESTION_ELEMENTS.filter(include);
  const mappingElements = MAPPING_ELEMENTS.filter(include);

  const renderTiles = (elements: ElementOption[], disabled = false) => (
    <Box
      gap="8px"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      }}
    >
      {elements.map((element) => (
        <CardButton
          key={element.inputType}
          iconName={element.icon}
          title={formatMessage(element.label)}
          disabled={disabled}
          width="100%"
          minHeight="0px"
          p="10px 12px"
          flexDirection="row"
          alignItems="center"
          gap="12px"
          onClick={(event) => {
            event.preventDefault();
            if (disabled || !targetGroup) return;
            onAddQuestion(element.inputType, questionPosition);
          }}
          data-cy={`e2e-add-element-${element.inputType}`}
        />
      ))}
    </Box>
  );

  return (
    <Modal
      opened
      close={onClose}
      width="820px"
      header={formatMessage(messages.addQuestion)}
    >
      <Box p="24px" pt="8px" display="flex" flexDirection="column" gap="28px">
        {/* Questions */}
        <Box>
          <Title variant="h5" as="h3" color="textSecondary" mt="0px">
            {formatMessage(messages.questions)}
          </Title>
          <Box
            display="flex"
            gap="16px"
            mb="16px"
            p="12px"
            bgColor={colors.grey100}
            borderRadius="3px"
          >
            <Box flex="1">
              <Select
                label={formatMessage(messages.insertQuestionOn)}
                value={questionPosition.pageId}
                options={pageOptions}
                onChange={(option) => {
                  const pageId = String(option.value);
                  const group = editableGroups.find(
                    (group) => group.page.id === pageId
                  );
                  // Default to the end of the newly chosen page.
                  setQuestionPosition({
                    pageId,
                    index: group?.questions.length ?? 0,
                  });
                }}
              />
            </Box>
            <Box flex="1">
              <Select
                label={formatMessage(messages.insertQuestionPosition)}
                value={`${questionPosition.index}`}
                options={positionOptions}
                onChange={(option) =>
                  setQuestionPosition({
                    ...questionPosition,
                    index: Number(option.value),
                  })
                }
              />
            </Box>
          </Box>
          {renderTiles(questionElements)}
        </Box>

        {mappingElements.length > 0 && (
          <Box>
            <Title variant="h5" as="h3" color="textSecondary" mt="0px">
              {formatMessage(messages.mapping)}
            </Title>
            {renderTiles(mappingElements, !isFormMappingEnabled)}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AddElementModal;
