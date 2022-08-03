import React from 'react';
import { JsonForms } from '@jsonforms/react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';

// renderers
import CLCategoryLayout, {
  clCategoryTester,
} from 'components/Form/Components/Layouts/CLCategoryLayout';
import OrderedLayout, {
  orderedLayoutTester,
} from 'components/Form/Components/Layouts/OrderedLayout';
import InputControl, {
  inputControlTester,
} from 'components/Form/Components/Controls/InputControl';
import TextAreaControl, {
  textAreaControlTester,
} from 'components/Form/Components/Controls/TextAreaControl';
import WYSIWYGControl, {
  WYSIWYGControlTester,
} from 'components/Form/Components/Controls/WYSIWYGControl';
import TopicsControl, {
  topicsControlTester,
} from 'components/Form/Components/Controls/TopicsControl';
import ImageControl, {
  imageControlTester,
} from 'components/Form/Components/Controls/ImageControl';
import AttachmentsControl, {
  attachmentsControlTester,
} from 'components/Form/Components/Controls/AttachmentsControl';
import DescriptionControl, {
  descriptionControlTester,
} from 'components/Form/Components/Controls/DescriptionControl';
import TitleControl, {
  titleControlTester,
} from 'components/Form/Components/Controls/TitleControl';
import SingleSelectControl, {
  singleSelectControlTester,
} from 'components/Form/Components/Controls/SingleSelectControl';
import MultiSelectControl, {
  multiSelectControlTester,
} from 'components/Form/Components/Controls/MultiSelectControl';
import UserPickerControl, {
  userPickerControlTester,
} from 'components/Form/Components/Controls/UserPickerControl';
import CheckboxControl, {
  checkboxControlTester,
} from 'components/Form/Components/Controls/CheckboxControl';
import LocationControl, {
  locationControlTester,
} from 'components/Form/Components/Controls/LocationControl';
import DateControl, {
  dateControlTester,
} from 'components/Form/Components/Controls/DateControl';
import MultilocInputLayout, {
  multilocInputTester,
} from 'components/Form/Components/Controls/MultilocInputLayout';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

const NativeSurveyForm = () => {
  const locale = useLocale();

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

  const dummyData = {
    name: 'John Doe',
  };

  // Dummy data mocking an API response. Once back office is set up, replace this with an API call.
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
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        width="100%"
        id="e2e-native-survey-form"
      >
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
