// renderers
import {
  AttachmentsControl,
  attachmentsControlTester,
  CheckboxControl,
  checkboxControlTester,
  CLCategoryLayout,
  clCategoryTester,
  DateControl,
  dateControlTester,
  DescriptionControl,
  descriptionControlTester,
  ImageControl,
  imageControlTester,
  InputControl,
  inputControlTester,
  LinearScaleControl,
  linearScaleControlTester,
  LocationControl,
  locationControlTester,
  MultilocInputLayout,
  multilocInputTester,
  MultiSelectCheckboxControl,
  multiSelectCheckboxControlTester,
  MultiSelectControl,
  multiSelectControlTester,
  OrderedLayout,
  orderedLayoutTester,
  SingleSelectControl,
  singleSelectControlTester,
  SingleSelectRadioControl,
  singleSelectRadioControlTester,
  TextAreaControl,
  textAreaControlTester,
  TitleControl,
  titleControlTester,
  TopicsControl,
  topicsControlTester,
  UserPickerControl,
  userPickerControlTester,
  WYSIWYGControl,
  WYSIWYGControlTester,
} from 'components/Form/Components/Controls';

const commonRenderers = [
  { tester: linearScaleControlTester, renderer: LinearScaleControl },
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

export const selectRenderers = (formType: 'default' | 'input') => {
  switch (formType) {
    case 'default':
      return commonRenderers;
    case 'input':
      return [
        { tester: linearScaleControlTester, renderer: LinearScaleControl },
        {
          tester: multiSelectCheckboxControlTester,
          renderer: MultiSelectCheckboxControl,
        },
        {
          tester: singleSelectRadioControlTester,
          renderer: SingleSelectRadioControl,
        },
        ...commonRenderers,
      ];
  }
};
