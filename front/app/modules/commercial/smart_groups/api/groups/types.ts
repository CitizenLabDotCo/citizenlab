import 'api/groups/types';
import { TRule } from '../../components/UserFilterConditions/rules';

declare module 'api/groups/types' {
  export interface IMembershipTypeMap {
    rules: 'rules';
  }

  export interface IGroupDataAttributes {
    rules?: TRule[];
  }

  export interface GroupDiff {
    rules?: IGroupData['attributes']['rules'];
  }
}
