import { IIdeaData } from 'services/ideas';
import useIdea from 'hooks/useIdea';
import { NilOrError } from 'utils/helperUtils';

interface Props {
  ideaId?: string | null;
  ideaSlug?: string | null;
  children?: children;
}

export type GetIdeaChildProps = IIdeaData | NilOrError;

type children = (renderProps: GetIdeaChildProps) => JSX.Element | null;

const GetIdea = ({ ideaId, ideaSlug, children }: Props) => {
  const idea = useIdea({ ideaId, ideaSlug });
  return (children as children)(idea);
};

export default GetIdea;
