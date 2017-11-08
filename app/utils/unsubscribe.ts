import * as Rx from 'rxjs';
import { isArray } from 'lodash';

export default function unsubscribe(sub: Rx.Subscription | Rx.Subscription[]): void {
  if (isArray(sub)) {
    sub.forEach((sub) => sub.unsubscribe());
  } else {
    sub.unsubscribe();
  }
}
