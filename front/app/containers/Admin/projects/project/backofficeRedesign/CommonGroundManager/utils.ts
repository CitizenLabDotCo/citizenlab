import { CommonGroundResultItem } from 'api/common_ground/types';

type Votes = CommonGroundResultItem['votes'];

export const totalReactions = (votes: Votes | undefined) =>
  votes ? votes.up + votes.down + votes.neutral : 0;
