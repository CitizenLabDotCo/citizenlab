import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import { basketByIdStream, IBasket, IBasketData } from 'services/baskets';

export default function useBasket(basketId: string | null | undefined) {
  const [basket, setBasket] = useState<IBasketData | undefined | null>(
    undefined
  );

  useEffect(() => {
    setBasket(undefined);

    let observable: Observable<IBasket | null> = of(null);

    if (basketId) {
      observable = basketByIdStream(basketId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const basket = !isNilOrError(response) ? response.data : response;
      setBasket(basket);
    });

    return () => subscription.unsubscribe();
  }, [basketId]);

  return basket;
}
