import React, { useState } from 'react';
import { createPortal } from 'react-dom';

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
import CLIndividualQuestionSurveyLayout, {
    clIndividualQuestionCategoryTester,
} from 'components/Form/Components/Layouts/CLIndividualQuestionSurveyLayout';
import OrderedLayout, {
  orderedLayoutTester,
} from 'components/Form/Components/Layouts/OrderedLayout';

import schema from './schema.json';
import uischema from './uischema.json';

const TypeFormSurveyExample = () => {
  const initialData = {
    name: 'Amanda',
    description: 'Long description',
  };

  const [data, setData] = useState<any>(initialData);

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
    { tester: clIndividualQuestionCategoryTester, renderer: CLIndividualQuestionSurveyLayout },
    { tester: orderedLayoutTester, renderer: OrderedLayout },
    { tester: locationControlTester, renderer: LocationControl },
    { tester: dateControlTester, renderer: DateControl },
    { tester: userPickerControlTester, renderer: UserPickerControl },
    { tester: multilocInputTester, renderer: MultilocInputLayout },
    { tester: orderedLayoutTester, renderer: OrderedLayout },
  ];

  return (
    <Box
      height="100vh"
      display='flex'
      width='100%'
      flexDirection='column'
      zIndex="10000"
      position="fixed"
      bgColor={colors.adminBackground}
      overflowY="auto"
    >
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' mt='100px'>
        <Title textAlign="center">
            Survey Title
          </Title>
          <Text textAlign="center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          </Text>
        </Box>

        <Box display='flex' height='60vh' justifyContent='center' alignItems='center'>
        <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={renderers}
            onChange={({ data }) => setData(data)}
        />
        </Box>

    </Box>
  )
};

const TypeFormSurveyTest = () => {
  const modalPortalElement = document.getElementById('modal-portal');

  return modalPortalElement
    ? createPortal(<TypeFormSurveyExample />, modalPortalElement)
    : null;
};
export default TypeFormSurveyTest;
