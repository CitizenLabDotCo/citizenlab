import { CommonGroundResultItem } from 'api/common_ground/types';

export type Votes = CommonGroundResultItem['votes'];

export const totalReactions = (votes: Votes | undefined) =>
  votes ? votes.up + votes.down + votes.neutral : 0;

export const agreePercent = (votes: Votes | undefined) => {
  const reactions = totalReactions(votes);

  return votes && reactions ? Math.round((votes.up / reactions) * 100) : 0;
};
