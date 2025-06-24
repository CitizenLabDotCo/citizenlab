import React from 'react';

import SideModal from 'components/UI/SideModal';

type Props = {
  opened: boolean;
  setSideViewOpened: (opened: boolean) => void;
};
const FileSideView = ({ opened, setSideViewOpened }: Props) => {
  return (
    <SideModal opened={opened} close={() => setSideViewOpened(false)}>
      Here is some content for the file side view.
    </SideModal>
  );
};

export default FileSideView;
