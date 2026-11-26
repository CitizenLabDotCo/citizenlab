import React from 'react';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';

import PhonePreviewFrame from 'components/admin/PhonePreview/PhonePreviewFrame';
import PhoneScreenSkeleton from 'components/admin/PhonePreview/PhoneScreenSkeleton';

import styles from './WorkspaceSkeleton.module.css';

// The preview stage while its phone has nothing to show yet.
const StageSkeleton = () => (
  <PhonePreviewBackdrop>
    <div className={styles.fill} aria-busy="true">
      <PhonePreviewFrame screen={null}>
        <PhoneScreenSkeleton hidden={false} />
      </PhonePreviewFrame>
    </div>
  </PhonePreviewBackdrop>
);

export default StageSkeleton;
