import useVerificationMethods from 'hooks/useVerificationMethods';
import { IVerificationMethods } from 'services/verificationMethods';

export type GetVerificationMethodsChildProps =
  | IVerificationMethods
  | undefined
  | null
  | Error;

type children = (
  renderProps: GetVerificationMethodsChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
}

export default (props: Props) => {
  const verificationMethods = useVerificationMethods();
  return (props.children as children)(verificationMethods);
};
