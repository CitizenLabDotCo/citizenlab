import React from 'react';

import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';

import styles from './ProjectContextPickers.module.css';
import useContextPickers from './useContextPickers';
import 'design-system/tokens.css';

interface Props {
  spaceId: string | null;
  folderId: string | null;
  projectInRoot: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

const ProjectContextPickers = ({
  spaceId,
  folderId,
  projectInRoot,
  onChange,
}: Props) => {
  const pickers = useContextPickers({
    spaceId,
    folderId,
    projectInRoot,
    onChange,
  });

  if (!pickers) return null;

  const { spacePicker, folderPicker, approvalWarning } = pickers;

  return (
    <div className={styles.pickers}>
      <div className={styles.row}>
        {spacePicker && <div className={styles.picker}>{spacePicker}</div>}
        <div className={styles.picker}>{folderPicker}</div>
      </div>

      {approvalWarning}
    </div>
  );
};

export default ProjectContextPickers;
