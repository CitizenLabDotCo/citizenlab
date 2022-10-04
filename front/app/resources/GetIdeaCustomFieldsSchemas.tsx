import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import { IIdeaFormSchemas } from 'services/ideaCustomFieldsSchemas';

export type GetIdeaCustomFieldsSchemasChildProps =
  | IIdeaFormSchemas
  | undefined
  | null
  | Error;

type children = (
  renderProps: GetIdeaCustomFieldsSchemasChildProps
) => JSX.Element | null;

interface Props {
  projectId: string | null;
  children?: children;
}

export default (props: Props) => {
  const ideaCustomFieldsSchema = useIdeaCustomFieldsSchemas({
    projectId: props.projectId,
  });
  return (props.children as children)(ideaCustomFieldsSchema);
};
