import React from 'react';
import { JsonForms } from '@jsonforms/react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

// renderers
import {
  CLCategoryLayout,
  clCategoryTester,
  OrderedLayout,
  orderedLayoutTester,
  InputControl,
  inputControlTester,
  TextAreaControl,
  textAreaControlTester,
  WYSIWYGControl,
  WYSIWYGControlTester,
  TopicsControl,
  topicsControlTester,
  ImageControl,
  imageControlTester,
  AttachmentsControl,
  attachmentsControlTester,
  DescriptionControl,
  descriptionControlTester,
  TitleControl,
  titleControlTester,
  SingleSelectControl,
  singleSelectControlTester,
  MultiSelectControl,
  multiSelectControlTester,
  UserPickerControl,
  userPickerControlTester,
  CheckboxControl,
  checkboxControlTester,
  LocationControl,
  locationControlTester,
  DateControl,
  dateControlTester,
  MultilocInputLayout,
  multilocInputTester,
} from 'components/Form/Components/Controls/';

const renderers = [
  { tester: inputControlTester, renderer: InputControl },
  { tester: textAreaControlTester, renderer: TextAreaControl },
  { tester: checkboxControlTester, renderer: CheckboxControl },
  { tester: singleSelectControlTester, renderer: SingleSelectControl },
  { tester: multiSelectControlTester, renderer: MultiSelectControl },
  { tester: WYSIWYGControlTester, renderer: WYSIWYGControl },
  { tester: descriptionControlTester, renderer: DescriptionControl },
  { tester: topicsControlTester, renderer: TopicsControl },
  { tester: titleControlTester, renderer: TitleControl },
  { tester: imageControlTester, renderer: ImageControl },
  { tester: attachmentsControlTester, renderer: AttachmentsControl },
  { tester: clCategoryTester, renderer: CLCategoryLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
  { tester: locationControlTester, renderer: LocationControl },
  { tester: dateControlTester, renderer: DateControl },
  { tester: userPickerControlTester, renderer: UserPickerControl },
  { tester: multilocInputTester, renderer: MultilocInputLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
];

const NativeSurveyForm = () => {
  const locale = useLocale();

  const dummyData = {
    name: 'John Doe',
  };

  // TODO Replace dummy data mocking API response with API call
  const dummyAPIResponse = {
    json_schema_multiloc: {
      en: {
        type: 'object',
        properties: {
          nameEnglish: {
            type: 'string',
            minLength: 1,
          },
        },
        required: ['name'],
      },
      'fr-BE': {
        type: 'object',
        properties: {
          nameFrench: {
            type: 'string',
            minLength: 1,
          },
        },
        required: ['name'],
      },
    },
    ui_schema_multiloc: {
      en: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/nameEnglish',
          },
        ],
      },
      'fr-BE': {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/nameFrench',
          },
        ],
      },
    },
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" justifyContent="center" width="100%">
        <Title marginTop="48px" width="100%" textAlign="center">
          Survey Title
        </Title>
        <Box
          padding="40px 40px 30px"
          borderRadius="4px"
          width="652px"
          background="white"
        >
          {!isNilOrError(locale) && (
            <JsonForms
              data={dummyData}
              schema={dummyAPIResponse.json_schema_multiloc[locale]}
              uischema={dummyAPIResponse.ui_schema_multiloc[locale]}
              renderers={renderers}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default NativeSurveyForm;
