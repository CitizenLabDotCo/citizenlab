import useCustomFieldsSchema, { CustomFieldsSchema } from 'hooks/useCustomFieldsSchema';

interface InputProps {}

type children = (renderProps: CustomFieldsSchema) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetCustomFieldsSchemaChildProps = CustomFieldsSchema;

export default ({ children }: Props) => {
  const customFieldsSchema = useCustomFieldsSchema();
  console.log(customFieldsSchema);
  return (children as children)(customFieldsSchema);
};
