import useTags, { IUseTag } from 'hooks/useTags';

export type GetTagsChildProps = IUseTag;

type children = (renderProps: IUseTag) => JSX.Element | null;

const GetTags: React.SFC<{}> = (props) => {
  const tags = useTags();
  return (props.children as children)(tags);
};

export default GetTags;
