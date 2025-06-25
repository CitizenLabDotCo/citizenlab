import React from 'react';

import SideModal from 'components/UI/SideModal';

type Props = {
  opened: boolean;
  selectedFileId: string | null;
  setSideViewOpened: (opened: boolean) => void;
};
const FileSideView = ({ opened, selectedFileId, setSideViewOpened }: Props) => {
  return (
    <SideModal opened={opened} close={() => setSideViewOpened(false)}>
      <h3 style={{ marginTop: '30px' }}>
        ToDo: Content for file side view. File ID: {selectedFileId}
      </h3>
    </SideModal>
  );
};

export default FileSideView;
