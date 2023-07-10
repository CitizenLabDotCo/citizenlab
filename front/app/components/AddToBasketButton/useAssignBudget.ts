import { useCallback, useState } from 'react';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useAddIdeaToBasket from 'api/baskets/useAddIdeaToBasket';

interface Props {
  ideaId: string;
}

const useAssignBudget = ({ ideaId }: Props) => {
  const [processing, setProcessing] = useState(false);
  const { data: idea } = useIdeaById(ideaId);
  const { mutateAsync: addIdeaToBasket } = useAddIdeaToBasket();

  const assignBudget = useCallback(
    async (action: 'add' | 'remove') => {
      if (!idea) return;

      const ideaBudget = idea.data.attributes.budget;
      if (!ideaBudget) return;

      setProcessing(true);

      await addIdeaToBasket({
        idea_id: idea.data.id,
        votes: action === 'add' ? ideaBudget : null,
      });

      setProcessing(false);
    },
    [addIdeaToBasket, idea]
  );

  return { assignBudget, processing };
};

export default useAssignBudget;
