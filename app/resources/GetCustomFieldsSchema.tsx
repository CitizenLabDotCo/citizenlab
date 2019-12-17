import useCustomFieldsSchema, { CustomFieldsSchema } from 'hooks/useCustomFieldsSchema';

interface InputProps {}

type children = (renderProps: GetCustomFieldsSchemaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetCustomFieldsSchemaChildProps = CustomFieldsSchema;

export default ({ children }: Props) => {
  const customFieldsSchema = useCustomFieldsSchema();
  return (children as children)(customFieldsSchema);
};
