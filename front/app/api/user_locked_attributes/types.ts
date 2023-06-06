import { Keys } from 'utils/cl-react-query/types';
import userLockedAttributes from './keys';

export type UserLockedAttributesKeys = Keys<typeof userLockedAttributes>;

export interface ILockedAttributeData {
  type: 'locked_attribute';
  id: string;
  attributes: {
    name: 'first_name' | 'last_name' | 'email';
  };
}

export type ILockedAttributes = {
  data: ILockedAttributeData[];
};
