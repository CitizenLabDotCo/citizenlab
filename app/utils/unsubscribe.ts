import { Subscription } from 'rxjs';
import { isArray } from 'lodash';

export default function unsubscribe(sub: Subscription | Subscription[]): void {
  if (isArray(sub)) {
    sub.forEach((sub) => sub.unsubscribe());
  } else {
    sub.unsubscribe();
  }
}
