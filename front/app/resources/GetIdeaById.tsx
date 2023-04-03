import { IIdeaData } from 'api/ideas/types';
import { NilOrError } from 'utils/helperUtils';
import useIdeaById from 'api/ideas/useIdeaById';

interface Props {
  ideaId: string;
  children?: children;
}

export type GetIdeaByIdChildProps = IIdeaData | NilOrError;

type children = (renderProps: GetIdeaByIdChildProps) => JSX.Element | null;

const GetIdeaById = ({ ideaId, children }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  return (children as children)(idea?.data);
};

export default GetIdeaById;
