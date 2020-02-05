import { useState, useEffect } from 'react';
import { listProjectHolderOrderings, IProjectHolderOrderingData } from 'services/projectHolderOrderings';

export default function useProjectHolderOrderings() {
  const [projectHolderOrderings, setProjectHolderOrderings] =
    useState<{ data: IProjectHolderOrderingData[] } | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = listProjectHolderOrderings().observable.subscribe((projectHolderOrderings) => {
      setProjectHolderOrderings(projectHolderOrderings);
    });

    return () => subscription.unsubscribe();
  }, []);

  return projectHolderOrderings;
}
