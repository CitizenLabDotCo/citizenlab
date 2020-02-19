import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import { IIdeaCustomFieldsSchemas } from 'services/ideaCustomFields';

interface Props {
  projectId: string;
  children: (renderProps: IIdeaCustomFieldsSchemas | undefined | null | Error) => JSX.Element | null;
}

export default (props: Props) => {
  const customFieldsSchema = useIdeaCustomFieldsSchemas({ projectId: props.projectId });
  return props.children(customFieldsSchema);
};
