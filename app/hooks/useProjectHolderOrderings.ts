import { useState, useEffect } from 'react';
import { listProjectHolderOrderings, IProjectHolderOrderingData } from 'services/projectHolderOrderings';

export default function useProjectHolderOrderings() {
  const [projectHolderOrderings, setProjectHolderOrderings] =
    useState<{ data: IProjectHolderOrderingData[] } | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = listProjectHolderOrderings().observable.subscribe((folderOrProjectOrderings) => {
      setProjectHolderOrderings(folderOrProjectOrderings);
    });

    return () => subscription.unsubscribe();
  }, []);

  return projectHolderOrderings;
}
