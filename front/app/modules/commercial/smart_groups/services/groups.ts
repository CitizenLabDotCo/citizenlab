import 'services/groups';
import { TRule } from '../components/UserFilterConditions/rules';

declare module 'services/groups' {
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
