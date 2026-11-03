import { IIdeaData } from 'api/ideas/types';

// An input with citizen activity on it keeps its approval: un-publishing would
// hide their participation, and a pending draft is one unconfirmed click away
// from deletion.
const hasEngagement = ({
  comments_count,
  likes_count,
  dislikes_count,
  baskets_count,
  votes_count,
}: IIdeaData['attributes']) =>
  comments_count > 0 ||
  likes_count > 0 ||
  dislikes_count > 0 ||
  baskets_count > 0 ||
  votes_count > 0;

export default hasEngagement;
