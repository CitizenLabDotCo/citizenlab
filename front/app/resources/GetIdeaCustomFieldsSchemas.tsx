import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import { IIdeaFormSchemas } from 'services/ideaCustomFieldsSchemas';
import { IIdeaJsonFormSchemas } from 'services/ideaJsonFormsSchema';

export type GetIdeaCustomFieldsSchemasChildProps =
  | IIdeaFormSchemas
  | IIdeaJsonFormSchemas
  | undefined
  | null
  | Error;

type children = (
  renderProps: GetIdeaCustomFieldsSchemasChildProps
) => JSX.Element | null;

interface Props {
  projectId: string | null;
  phaseId?: string | null;
  children?: children;
}

export default (props: Props) => {
  const ideaCustomFieldsSchema = useIdeaCustomFieldsSchemas({
    projectId: props.projectId,
    phaseId: props.phaseId,
  });
  return (props.children as children)(ideaCustomFieldsSchema);
};
