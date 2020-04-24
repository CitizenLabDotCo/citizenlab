import useUserCustomFieldsSchema, { CustomFieldsSchema } from 'hooks/useUserCustomFieldsSchema';

interface InputProps {}

type children = (renderProps: GetCustomFieldsSchemaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetCustomFieldsSchemaChildProps = CustomFieldsSchema;

export default ({ children }: Props) => {
  const userCustomFieldsSchema = useUserCustomFieldsSchema();
  return (children as children)(userCustomFieldsSchema);
};
