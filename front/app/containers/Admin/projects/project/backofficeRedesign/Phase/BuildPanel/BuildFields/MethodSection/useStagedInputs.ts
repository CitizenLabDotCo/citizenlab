import { useState } from 'react';

import { Multiloc } from 'typings';

import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import useJobInProgressByPhase from 'api/copy_inputs/useJobInProgressByPhase';
import useAddIdea from 'api/ideas/useAddIdea';
import useIdeas from 'api/ideas/useIdeas';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';

import { getPageNumberFromUrl } from 'utils/paginationUtils';

export interface InputValues {
  title_multiloc: Multiloc;
  author_id?: string | null;
  anonymous?: boolean;
}

interface StagedImport {
  fromPhaseId: string;
  count: number;
}

export interface LinkedIdea {
  id: string;
  phaseIds: string[];
}

const useSavedCount = (projectId: string, phaseId: string) => {
  const { data, refetch } = useIdeas({
    'page[size]': 1,
    projects: [projectId],
    phase: phaseId,
  });

  const count =
    !data || data.data.length === 0
      ? 0
      : getPageNumberFromUrl(data.links.last) ?? 0;
  return { count, refetch };
};

const useStagedInputs = (projectId: string, phaseId: string) => {
  const { count: savedCount, refetch: refetchSavedCount } = useSavedCount(
    projectId,
    phaseId
  );
  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: copyInputs } = useCopyInputs();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  // Polls a running import and refreshes the idea lists once it's done.
  const { data: jobs, refetch: refetchJobs } = useJobInProgressByPhase(phaseId);
  const [staged, setStaged] = useState<InputValues[]>([]);
  const [imports, setImports] = useState<StagedImport[]>([]);
  const [links, setLinks] = useState<LinkedIdea[]>([]);
  // The count shown while saving, so it doesn't dip before the new one loads.
  const [savingCount, setSavingCount] = useState<number | null>(null);

  const add = (values: InputValues) =>
    setStaged((staged) => [...staged, values]);

  // Importing the same phase twice copies it once, so a repeat replaces it.
  const addImport = (fromPhaseId: string, count: number) =>
    setImports((imports) => [
      ...imports.filter((staged) => staged.fromPhaseId !== fromPhaseId),
      { fromPhaseId, count },
    ]);

  // An idea can sit in several earlier phases, so it's only linked once.
  const addLinks = (ideas: LinkedIdea[]) =>
    setLinks((links) => [
      ...links,
      ...ideas.filter(({ id }) => !links.some((link) => link.id === id)),
    ]);

  const importedCount = imports.reduce((sum, { count }) => sum + count, 0);
  const count = savedCount + staged.length + importedCount + links.length;

  const save = async () => {
    setSavingCount(count);
    try {
      // Each item leaves the stage once saved, so a failed save can be retried
      // without creating it twice.
      for (const { fromPhaseId } of imports) {
        await copyInputs({ toPhaseId: phaseId, fromPhaseId });
        setImports(([, ...rest]) => rest);
      }
      for (const { id, phaseIds } of links) {
        await updateIdea({
          id,
          requestBody: { phase_ids: [...phaseIds, phaseId] },
        });
        setLinks(([, ...rest]) => rest);
      }
      for (const values of staged) {
        await addIdea({
          phaseId,
          requestBody: { ...values, publication_status: 'published' },
        });
        setStaged(([, ...rest]) => rest);
      }
      await Promise.all([refetchSavedCount(), refetchJobs()]);
    } finally {
      setSavingCount(null);
    }
  };

  useRegisterPageSaver('inputs', {
    dirty: staged.length > 0 || imports.length > 0 || links.length > 0,
    save,
  });

  const job = jobs?.data[0]?.attributes;

  return {
    count: savingCount ?? count,
    saving: savingCount !== null,
    importProgress: job && { done: job.progress, total: job.total },
    add,
    addImport,
    addLinks,
  };
};

export default useStagedInputs;
