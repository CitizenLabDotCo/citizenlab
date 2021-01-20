import useIdeaCustomField from '../hooks/useIdeaCustomField';
import {
  IIdeaCustomFieldData,
  CustomFieldCodes,
} from '../services/ideaCustomFields';

export type GetIdeaCustomFieldChildProps =
  | IIdeaCustomFieldData
  | undefined
  | null
  | Error;

type children = (
  renderProps: GetIdeaCustomFieldChildProps
) => JSX.Element | null;

interface Props {
  projectId: string | null;
  customFieldCode: CustomFieldCodes;
  children?: children;
}

export default ({ projectId, customFieldCode, ...props }: Props) => {
  const customFields = useIdeaCustomField({ projectId, customFieldCode });
  return (props.children as children)(customFields);
};
