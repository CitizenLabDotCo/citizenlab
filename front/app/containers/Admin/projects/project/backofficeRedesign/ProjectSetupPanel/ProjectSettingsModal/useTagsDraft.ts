import { useRef, useState } from 'react';

import { IInputTopicData } from 'api/input_topics/types';
import useAddInputTopic from 'api/input_topics/useAddInputTopic';
import useDeleteInputTopic from 'api/input_topics/useDeleteInputTopic';
import useInputTopics from 'api/input_topics/useInputTopics';
import useMoveInputTopic from 'api/input_topics/useMoveInputTopic';
import useUpdateInputTopic from 'api/input_topics/useUpdateInputTopic';

import { InputTopicFormValues } from 'containers/Admin/projects/project/topics/InputTopicModal';

const DRAFT_ID_PREFIX = 'draft-';

const isDraftId = (id: string) => id.startsWith(DRAFT_ID_PREFIX);

const getParentId = (tag: IInputTopicData) =>
  tag.relationships.parent?.data?.id;

const getSiblings = (tags: IInputTopicData[], parentId?: string) =>
  tags.filter((tag) => getParentId(tag) === parentId);

const hasChanged = (saved: IInputTopicData, draft: IInputTopicData) =>
  JSON.stringify(saved.attributes.title_multiloc) !==
    JSON.stringify(draft.attributes.title_multiloc) ||
  JSON.stringify(saved.attributes.description_multiloc) !==
    JSON.stringify(draft.attributes.description_multiloc) ||
  saved.attributes.icon !== draft.attributes.icon;

// Tag changes stay in this draft until the settings modal is saved. The draft
// has the same shape as the API data, so the tag list renders either one.
const useTagsDraft = (projectId: string) => {
  const { data: inputTopics, refetch } = useInputTopics(projectId);
  const { mutateAsync: addInputTopic } = useAddInputTopic();
  const { mutateAsync: updateInputTopic } = useUpdateInputTopic();
  const { mutateAsync: deleteInputTopic } = useDeleteInputTopic();
  const { mutateAsync: moveInputTopic } = useMoveInputTopic();

  const [draft, setDraft] = useState<IInputTopicData[] | null>(null);
  const nextDraftId = useRef(0);

  const tags = draft ?? inputTopics?.data;

  const change = (update: (current: IInputTopicData[]) => IInputTopicData[]) =>
    setDraft((current) => update(current ?? inputTopics?.data ?? []));

  const addTag = (values: InputTopicFormValues, parentId?: string) => {
    const tag: IInputTopicData = {
      id: `${DRAFT_ID_PREFIX}${nextDraftId.current++}`,
      type: 'input_topic',
      attributes: {
        title_multiloc: values.title_multiloc,
        description_multiloc: values.description_multiloc,
        full_title_multiloc: values.title_multiloc,
        icon: values.icon ?? null,
        parent_icon: null,
        depth: parentId ? 1 : 0,
        lft: 0,
        rgt: 0,
        children_count: 0,
      },
      relationships: {
        project: { data: { id: projectId, type: 'project' } },
        parent: {
          data: parentId ? { id: parentId, type: 'input_topic' } : null,
        },
      },
    };
    change((current) => [...current, tag]);
  };

  const updateTag = (id: string, values: InputTopicFormValues) =>
    change((current) =>
      current.map((tag) =>
        tag.id === id
          ? {
              ...tag,
              attributes: {
                ...tag.attributes,
                ...values,
                // Subtags have no icon, so the form leaves it out for them.
                icon:
                  values.icon === undefined ? tag.attributes.icon : values.icon,
              },
            }
          : tag
      )
    );

  // Deleting a tag also deletes its subtags, as the API does.
  const removeTag = (id: string) =>
    change((current) =>
      current.filter((tag) => tag.id !== id && getParentId(tag) !== id)
    );

  // `siblings` is one group (the root tags, or one tag's subtags) in its new
  // order. The other tags keep their place.
  const reorder = (siblings: IInputTopicData[]) =>
    change((current) => {
      const ids = new Set(siblings.map(({ id }) => id));
      const next = [...siblings];
      return current.map((tag) =>
        ids.has(tag.id) ? next.shift() ?? tag : tag
      );
    });

  const moveToOrder = async (savedIds: string[], draftIds: string[]) => {
    const order = [...savedIds];

    for (const [index, id] of draftIds.entries()) {
      if (order[index] === id) continue;

      await moveInputTopic(
        index === 0
          ? { projectId, id, position: 'left', target_id: order[0] }
          : { projectId, id, position: 'right', target_id: draftIds[index - 1] }
      );
      order.splice(order.indexOf(id), 1);
      order.splice(index, 0, id);
    }
  };

  // Returns whether everything was saved. What failed stays in the draft, so
  // saving again only retries that.
  const save = async () => {
    if (!draft || !inputTopics) return true;

    let saved = true;
    const attempt = async (request: () => Promise<unknown>) => {
      try {
        await request();
      } catch {
        saved = false;
      }
    };

    const draftIds = new Set(draft.map(({ id }) => id));
    const savedById = new Map(inputTopics.data.map((tag) => [tag.id, tag]));

    for (const tag of inputTopics.data) {
      const parentId = getParentId(tag);
      const deletedWithParent = !!parentId && !draftIds.has(parentId);
      if (!draftIds.has(tag.id) && !deletedWithParent) {
        await attempt(() => deleteInputTopic({ projectId, id: tag.id }));
      }
    }

    for (const tag of draft) {
      const savedTag = savedById.get(tag.id);
      if (savedTag && hasChanged(savedTag, tag)) {
        const { title_multiloc, description_multiloc, icon, depth } =
          tag.attributes;
        await attempt(() =>
          updateInputTopic({
            projectId,
            id: tag.id,
            title_multiloc,
            description_multiloc,
            ...(depth === 0 ? { icon } : {}),
          })
        );
      }
    }

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

        await attempt(() => moveToOrder(savedIds, draftOrder));
      }
    }

    await refetch();
    setDraft(saved ? null : nextDraft);
    return saved;
  };

  return {
    tags,
    dirty: draft !== null,
    addTag,
    updateTag,
    removeTag,
    reorder,
    save,
    reset: () => setDraft(null),
  };
};

export type TagsDraft = ReturnType<typeof useTagsDraft>;

export default useTagsDraft;
