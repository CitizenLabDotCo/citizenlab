// renderers
import {
  linearScaleControlTester,
  LinearScaleControl,
  inputControlTester,
  InputControl,
  textAreaControlTester,
  TextAreaControl,
  multiSelectCheckboxControlTester,
  MultiSelectCheckboxControl,
  singleSelectRadioControlTester,
  SingleSelectRadioControl,
  WYSIWYGControlTester,
  WYSIWYGControl,
  descriptionControlTester,
  DescriptionControl,
  topicsControlTester,
  TopicsControl,
  titleControlTester,
  TitleControl,
  imageControlTester,
  ImageControl,
  attachmentsControlTester,
  AttachmentsControl,
  clCategoryTester,
  clPageTester,
  CLCategoryLayout,
  CLPageLayout,
  locationControlTester,
  LocationControl,
  dateControlTester,
  DateControl,
  userPickerControlTester,
  UserPickerControl,
  multilocInputTester,
  MultilocInputLayout,
  orderedLayoutTester,
  OrderedLayout,
  checkboxControlTester,
  singleSelectControlTester,
  CheckboxControl,
  MultiSelectControl,
  multiSelectControlTester,
  SingleSelectControl,
  singleAttachmentControlTester,
  SingleAttachmentControl,
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
  { tester: clPageTester, renderer: CLPageLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
  { tester: locationControlTester, renderer: LocationControl },
  { tester: dateControlTester, renderer: DateControl },
  { tester: userPickerControlTester, renderer: UserPickerControl },
  { tester: multilocInputTester, renderer: MultilocInputLayout },
  { tester: orderedLayoutTester, renderer: OrderedLayout },
];

export const selectRenderers = (formType: 'default' | 'input' | 'survey') => {
  switch (formType) {
    case 'default':
      return commonRenderers;
    case 'survey':
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
        {
          tester: singleAttachmentControlTester,
          renderer: SingleAttachmentControl,
        },
        ...commonRenderers,
      ];
  }
};
