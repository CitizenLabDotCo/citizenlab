import { useRef, useState } from 'react';

import { IInputTopicData } from 'api/input_topics/types';
import useInputTopics from 'api/input_topics/useInputTopics';

import { InputTopicFormValues } from 'containers/Admin/projects/project/topics/InputTopicModal';

import useSaveTagsDraft from './useSaveTagsDraft';
import { DRAFT_ID_PREFIX, getParentId } from './utils';

// Tag changes stay in this draft until the settings modal is saved. The draft
// has the same shape as the API data, so the tag list renders either one.
const useTagsDraft = (projectId: string) => {
  const { data: inputTopics } = useInputTopics(projectId);
  const saveDraft = useSaveTagsDraft(projectId);

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

  // Returns whether everything was saved. What failed stays in the draft, so
  // saving again only retries that.
  const save = async () => {
    if (!draft || !inputTopics) return true;

    const { saved, nextDraft } = await saveDraft(draft, inputTopics.data);
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
