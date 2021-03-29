import useUserCustomFieldsSchema, {
  UserCustomFieldsSchema,
} from '../hooks/useUserCustomFieldsSchema';

interface InputProps {}

type children = (
  renderProps: GetUserCustomFieldsSchemaChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetUserCustomFieldsSchemaChildProps = UserCustomFieldsSchema;

export default ({ children }: Props) => {
  const userCustomFieldsSchema = useUserCustomFieldsSchema();
  return (children as children)(userCustomFieldsSchema);
};
