import { IInputTopicData } from 'api/input_topics/types';
import useAddInputTopic from 'api/input_topics/useAddInputTopic';
import useDeleteInputTopic from 'api/input_topics/useDeleteInputTopic';
import useInputTopics from 'api/input_topics/useInputTopics';
import useMoveInputTopic from 'api/input_topics/useMoveInputTopic';
import useUpdateInputTopic from 'api/input_topics/useUpdateInputTopic';

import { getParentId, getSiblings, hasChanged, isDraftId } from './utils';

// Sends a tags draft to the API, one request per change.
const useSaveTagsDraft = (projectId: string) => {
  const { refetch } = useInputTopics(projectId);
  const { mutateAsync: addInputTopic } = useAddInputTopic();
  const { mutateAsync: updateInputTopic } = useUpdateInputTopic();
  const { mutateAsync: deleteInputTopic } = useDeleteInputTopic();
  const { mutateAsync: moveInputTopic } = useMoveInputTopic();

  // Returns how many tags were moved.
  const moveToOrder = async (savedIds: string[], draftIds: string[]) => {
    const order = [...savedIds];
    let moves = 0;

    for (const [index, id] of draftIds.entries()) {
      if (order[index] === id) continue;

      await moveInputTopic(
        index === 0
          ? { projectId, id, position: 'left', target_id: order[0] }
          : { projectId, id, position: 'right', target_id: draftIds[index - 1] }
      );
      moves++;
      order.splice(order.indexOf(id), 1);
      order.splice(index, 0, id);
    }

    return moves;
  };

  // Returns whether everything was saved, and the draft that is left: what
  // failed, with the ids of the tags that were created.
  return async (draft: IInputTopicData[], savedTags: IInputTopicData[]) => {
    let saved = true;
    const attempt = async (request: () => Promise<unknown>) => {
      try {
        await request();
      } catch {
        saved = false;
      }
    };

    const draftIds = new Set(draft.map(({ id }) => id));
    const savedById = new Map(savedTags.map((tag) => [tag.id, tag]));

    for (const tag of savedTags) {
      const parentId = getParentId(tag);
      const deletedWithParent = !!parentId && !draftIds.has(parentId);
      if (!draftIds.has(tag.id) && !deletedWithParent) {
        await attempt(() => deleteInputTopic({ projectId, id: tag.id }));
      }
    }

    // Edits don't change the tree, so unlike the other steps they can run
    // at the same time.
    await Promise.all(
      draft.flatMap((tag) => {
        const savedTag = savedById.get(tag.id);
        if (!savedTag || !hasChanged(savedTag, tag)) return [];

        const { title_multiloc, description_multiloc, icon, depth } =
          tag.attributes;
        return [
          attempt(() =>
            updateInputTopic({
              projectId,
              id: tag.id,
              title_multiloc,
              description_multiloc,
              ...(depth === 0 ? { icon } : {}),
            })
          ),
        ];
      })
    );

    const createdIds = new Map<string, string>();
    const realId = (id: string) => createdIds.get(id) ?? id;
    const newTags = draft
      .filter(({ id }) => isDraftId(id))
      .sort((a, b) => a.attributes.depth - b.attributes.depth);

    for (const tag of newTags) {
      const parentId = getParentId(tag);
      if (parentId && isDraftId(realId(parentId))) {
        saved = false;
        continue;
      }

      const { title_multiloc, description_multiloc, icon } = tag.attributes;
      await attempt(async () => {
        const { data } = await addInputTopic({
          projectId,
          title_multiloc,
          description_multiloc,
          icon: parentId ? undefined : icon,
          parent_id: parentId && realId(parentId),
        });
        createdIds.set(tag.id, data.id);
      });
    }

    const nextDraft = draft.map((tag) => {
      const parentId = getParentId(tag);
      return {
        ...tag,
        id: realId(tag.id),
        relationships: {
          ...tag.relationships,
          parent: {
            data: parentId
              ? { id: realId(parentId), type: 'input_topic' }
              : null,
          },
        },
      };
    });

    // New tags are added at the end of their group, so the order is compared
    // with the list as the server now has it.
    let moved = 0;
    const { data: current } = await refetch();
    if (current) {
      const rootIds = nextDraft
        .filter(({ attributes }) => attributes.depth === 0)
        .map(({ id }) => id);
      const groups = [undefined, ...rootIds];

      for (const parentId of groups) {
        const savedIds = getSiblings(current.data, parentId).map(
          ({ id }) => id
        );
        const draftOrder = getSiblings(nextDraft, parentId)
          .map(({ id }) => id)
          .filter((id) => savedIds.includes(id));

        await attempt(async () => {
          moved += await moveToOrder(savedIds, draftOrder);
        });
      }
    }

    // Without moves, the list fetched above is already up to date.
    if (moved > 0) await refetch();
    return { saved, nextDraft };
  };
};

export default useSaveTagsDraft;
