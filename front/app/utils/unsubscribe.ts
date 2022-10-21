import { isArray } from 'lodash-es';
import { Subscription } from 'rxjs';

export default function unsubscribe(sub: Subscription | Subscription[]): void {
  if (isArray(sub)) {
    sub.forEach((sub) => sub.unsubscribe());
  } else {
    sub.unsubscribe();
  }
}
