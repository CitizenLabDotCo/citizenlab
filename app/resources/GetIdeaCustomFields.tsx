import useIdeaCustomFields from 'hooks/useIdeaCustomFields';
import { IIdeaCustomFields, IIdeaCustomFieldData } from 'services/ideaCustomFields';

export type GetIdeaCustomFieldsChildProps = IIdeaCustomFields | undefined | null | Error;

type children = (renderProps: GetIdeaCustomFieldsChildProps) => JSX.Element | null;

interface Props {
  projectId: string;
  children?: children;
}

export default (props: Props) => {
  const customFields = useIdeaCustomFields({ projectId: props.projectId });
  return (props.children as children)(customFields);
};
