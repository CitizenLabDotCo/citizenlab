import { useState, useEffect } from 'react';
import { listFolderOrProjectOrderings, IFolderOrProjectOrderingData } from 'services/folderOrProjectOrderings';

export default function useFolderOrProjectOdergings() {
  const [folderOrProjectOrderings, setFolderOrProjectOdergings] =
    useState<{ data: IFolderOrProjectOrderingData[] } | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = listFolderOrProjectOrderings().observable.subscribe((folderOrProjectOrderings) => {
      setFolderOrProjectOdergings(folderOrProjectOrderings);
    });

    return () => subscription.unsubscribe();
  }, []);

  return folderOrProjectOrderings;
}
