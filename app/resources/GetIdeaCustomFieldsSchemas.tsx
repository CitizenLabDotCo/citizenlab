import useIdeaCustomFieldsSchemas from '../hooks/useIdeaCustomFieldsSchemas';
import { IIdeaCustomFieldsSchemas } from '../services/ideaCustomFields';

export type GetIdeaCustomFieldsSchemasChildProps =
  | IIdeaCustomFieldsSchemas
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
