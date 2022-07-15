import React, { useState } from 'react';

// Components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';

// Styling
import { colors } from 'utils/styleUtils';

// JSON Forms
import { JsonForms } from '@jsonforms/react';
import InputControl, {
  inputControlTester,
} from 'components/Form/Components/Controls/InputControl';
import TextAreaControl, {
  textAreaControlTester,
} from 'components/Form/Components/Controls/TextAreaControl';
import AttachmentsControl, {
  attachmentsControlTester,
} from 'components/Form/Components/Controls/AttachmentsControl';
import CheckboxControl, {
  checkboxControlTester,
} from 'components/Form/Components/Controls/CheckboxControl';
import DateControl, {
  dateControlTester,
} from 'components/Form/Components/Controls/DateControl';
import DescriptionControl, {
  descriptionControlTester,
} from 'components/Form/Components/Controls/DescriptionControl';
import ImageControl, {
  imageControlTester,
} from 'components/Form/Components/Controls/ImageControl';
import LocationControl, {
  locationControlTester,
} from 'components/Form/Components/Controls/LocationControl';
import MultilocInputLayout, {
  multilocInputTester,
} from 'components/Form/Components/Controls/MultilocInputLayout';
import MultiSelectControl, {
  multiSelectControlTester,
} from 'components/Form/Components/Controls/MultiSelectControl';
import SingleSelectControl, {
  singleSelectControlTester,
} from 'components/Form/Components/Controls/SingleSelectControl';
import TitleControl, {
  titleControlTester,
} from 'components/Form/Components/Controls/TitleControl';
import TopicsControl, {
  topicsControlTester,
} from 'components/Form/Components/Controls/TopicsControl';
import UserPickerControl, {
  userPickerControlTester,
} from 'components/Form/Components/Controls/UserPickerControl';
import WYSIWYGControl, {
  WYSIWYGControlTester,
} from 'components/Form/Components/Controls/WYSIWYGControl';
import CLCategoryLayout, {
  clCategoryTester,
} from 'components/Form/Components/Layouts/CLCategoryLayout';
import OrderedLayout, {
  orderedLayoutTester,
} from 'components/Form/Components/Layouts/OrderedLayout';

export default () => {
  const initialData = {
    name: 'Amanda',
    description: 'Long description',
  };

  const [data, setData] = useState<any>(initialData);

  const jsonSchema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        minLength: 3,
        description: 'Please enter your first name',
      },
      secondName: {
        type: 'string',
        minLength: 3,
        description: 'Please enter your second name',
      },
      vegetarian: {
        type: 'boolean',
      },
      birthDate: {
        type: 'string',
        format: 'date',
        description: 'Please enter your birth date.',
      },
      nationality: {
        type: 'array',
        title: 'Comments',
        items: {
          type: 'string',
          options: ['One', 'Two', 'Three'], // Not working right now - check out the MultiSelectControl.tsx. Hard-coded some values for testing.
        },
      },
      provideAddress: {
        type: 'boolean',
      },
      address: {
        type: 'object',
        properties: {
          street: {
            type: 'string',
          },
          streetNumber: {
            type: 'string',
          },
          city: {
            type: 'string',
          },
          postalCode: {
            type: 'string',
            maxLength: 5,
          },
        },
      },
      vegetarianOptions: {
        type: 'object',
        properties: {
          vegan: {
            type: 'boolean',
          },
          favoriteVegetable: {
            type: 'string',
            enum: [
              'Tomato',
              'Potato',
              'Salad',
              'Aubergine',
              'Cucumber',
              'Other',
            ],
          },
          otherFavoriteVegetable: {
            type: 'string',
          },
        },
      },
    },
  };

  const uiJsonSchema = {
    type: 'Categorization',
    elements: [
      {
        type: 'Category',
        label: 'Basic Information',
        elements: [
          {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/firstName',
              },
              {
                type: 'Control',
                scope: '#/properties/secondName',
              },
            ],
          },
          {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/birthDate',
              },
              {
                type: 'Control',
                label: 'Nationality Multiselect',
                scope: '#/properties/nationality',
              },
            ],
          },
          {
            type: 'Control',
            scope: '#/properties/provideAddress',
          },
          {
            type: 'Control',
            scope: '#/properties/vegetarian',
          },
        ],
      },
      {
        type: 'Category',
        label: 'Address',
        elements: [
          {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/address/properties/street',
              },
              {
                type: 'Control',
                scope: '#/properties/address/properties/streetNumber',
              },
            ],
          },
          {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/address/properties/city',
              },
              {
                type: 'Control',
                scope: '#/properties/address/properties/postalCode',
              },
            ],
          },
        ],
        rule: {
          effect: 'SHOW',
          condition: {
            scope: '#/properties/provideAddress',
            schema: {
              const: true,
            },
          },
        },
      },
      {
        type: 'Category',
        label: 'Additional',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/vegetarianOptions/properties/vegan',
          },
          {
            type: 'Control',
            scope:
              '#/properties/vegetarianOptions/properties/favoriteVegetable',
          },
          {
            type: 'Control',
            scope:
              '#/properties/vegetarianOptions/properties/otherFavoriteVegetable',
          },
        ],
      },
    ],
    options: {
      variant: 'stepper',
      showNavButtons: true,
    },
  };

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

  return (
    <Box
      overflowY="scroll"
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.adminBackground}
      h="100vh"
      marginTop="-80px"
      justifyContent="center"
    >
      <Box
        marginTop="1250px"
        padding="36px"
        borderRadius="5px"
        width="700px"
        marginRight="auto"
        marginLeft="auto"
        display="flex"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box width="100%" flexGrow={1} flexShrink={1}>
          <Title textAlign="center" width="100%">
            Survey Title
          </Title>
          <Text textAlign="center" width="100%">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </Text>
        </Box>
        <JsonForms
          schema={jsonSchema}
          uischema={uiJsonSchema}
          data={data}
          renderers={renderers}
          onChange={({ data }) => setData(data)}
        />
      </Box>
    </Box>
  );
};
