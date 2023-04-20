import { ICommentData } from 'api/comments/types';
import useComment from 'api/comments/useComment';

interface InputProps {
  id: string;
}

type children = (renderProps: GetCommentChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetCommentChildProps = ICommentData | undefined;

const GetComment = ({ id, children }: Props) => {
  const { data: comment } = useComment(id);

  return (children as children)(comment?.data);
};

export default GetComment;
