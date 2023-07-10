import { useState, useCallback, useMemo } from 'react';
import useAddIdeaToBasket from 'api/baskets/useAddIdeaToBasket';
import { debounce } from 'lodash-es';

const useAssignVote = () => {
  const [processing, setProcessing] = useState(false);
  const { mutateAsync } = useAddIdeaToBasket();

  const handleBasketUpdate = useCallback(
    async (ideaId: string, votes: number) => {
      await mutateAsync({ idea_id: ideaId, votes: votes === 0 ? null : votes });
      setProcessing(true);
    },
    [mutateAsync]
  );

  const handleBasketUpdateDebounced = useMemo(() => {
    return debounce(handleBasketUpdate, 300);
  }, [handleBasketUpdate]);

  const updateBasket = useCallback(
    async (ideaId: string, newVotes: number) => {
      setProcessing(true);
      await handleBasketUpdateDebounced(ideaId, newVotes);
    },
    [handleBasketUpdateDebounced]
  );

  const cancel = useCallback(() => {
    handleBasketUpdateDebounced.cancel();
    setProcessing(false);
  }, [handleBasketUpdateDebounced]);

  return {
    updateBasket,
    processing,
    cancel,
  };
};

export default useAssignVote;
