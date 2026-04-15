import useImportJobProgress from './useImportJobProgress';

const useTrackImportJobProgress = (phaseId: string) => {
  const { data } = useImportJobProgress(phaseId);

  const latestJob = data?.data[0];

  return {
    importing: latestJob?.attributes.completed_at === null,
    importHasErrors: (latestJob?.attributes.error_count ?? 0) > 0,
    importProgress: latestJob?.attributes.progress ?? 0,
    importTotal: latestJob?.attributes.total ?? 0,
    errorCount: latestJob?.attributes.error_count ?? 0,
  };
};

export default useTrackImportJobProgress;
