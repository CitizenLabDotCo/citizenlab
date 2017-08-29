import * as Rx from 'rxjs/Rx';

export default function subscribedComponent(target) {
  function unsub(target) {
    if (target.subscription) {
      target.subscription.unsubscribe();
    }

    if (target.subscriptions) {
      target.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  if (!target.componentWillUnmount) {
    target.componentWillUnmount = () => {
      unsub(target);
    };
  } else {
    const composed = target.componentWillUnmount;
    target.componentWillUnmount = () => {
      unsub(target);
      composed();
    };
  }
}
