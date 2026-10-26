import { useState } from 'react';

import { Multiloc } from 'typings';
import { v4 as uuidv4 } from 'uuid';

import { ICauseData } from 'api/causes/types';
import useAddCause from 'api/causes/useAddCause';
import useCauses from 'api/causes/useCauses';
import useDeleteCause from 'api/causes/useDeleteCause';
import useUpdateCause from 'api/causes/useUpdateCause';

import {
  CauseFormValues,
  toSubmitValues,
} from 'containers/Admin/projects/project/volunteering/useCauseForm';

import { useRegisterPageSaver } from '../../_shared/PageSaveContext';

export interface StagedCause {
  key: string;
  saved?: ICauseData;
  changes?: CauseFormValues;
}

export const causeTitle = ({ saved, changes }: StagedCause): Multiloc =>
  changes?.title_multiloc ?? saved?.attributes.title_multiloc ?? {};

export const causeImageUrl = ({ saved, changes }: StagedCause) =>
  changes ? changes.image?.[0]?.base64 : saved?.attributes.image?.medium;

const useStagedCauses = (phaseId: string) => {
  const { data: causes } = useCauses({ phaseId });
  const { mutateAsync: addCause } = useAddCause();
  const { mutateAsync: updateCause } = useUpdateCause();
  const { mutateAsync: deleteCause } = useDeleteCause();

  const [staged, setStaged] = useState<StagedCause[] | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const savedList: StagedCause[] = (causes?.data ?? []).map((cause) => ({
    key: cause.id,
    saved: cause,
  }));
  const list = staged ?? savedList;

  const stage = (update: (current: StagedCause[]) => StagedCause[]) =>
    setStaged((staged) => update(staged ?? savedList));

  const add = (changes: CauseFormValues) =>
    stage((current) => [...current, { key: uuidv4(), changes }]);

  const update = (key: string, changes: CauseFormValues) =>
    stage((current) =>
      current.map((cause) =>
        cause.key === key ? { ...cause, changes } : cause
      )
    );

  const remove = ({ key, saved }: StagedCause) => {
    stage((current) => current.filter((cause) => cause.key !== key));
    if (saved) setRemovedIds((ids) => [...ids, saved.id]);
  };

  const save = async () => {
    if (!staged) return;

    await Promise.all(removedIds.map((id) => deleteCause(id)));
    await Promise.all(
      staged.flatMap(({ saved, changes }) =>
        saved && changes
          ? [
              updateCause({
                id: saved.id,
                requestBody: toSubmitValues(changes),
              }),
            ]
          : []
      )
    );
    for (const { saved, changes } of staged) {
      if (!saved && changes) {
        await addCause({ phase_id: phaseId, ...toSubmitValues(changes) });
      }
    }

    setStaged(null);
    setRemovedIds([]);
  };

  useRegisterPageSaver('causes', { dirty: staged !== null, save });

  return { list, add, update, remove };
};

export default useStagedCauses;
