import { ReactElement, ReactNode } from 'react';

interface Props {
  condition: boolean;
  children: ReactElement;
  wrapper: (children: ReactNode) => ReactElement;
}

const ConditionalWrapper = ({ condition, wrapper, children }: Props) =>
  condition ? wrapper(children) : children;

export default ConditionalWrapper;
