import React, { ReactElement } from 'react';

import GoBackButton from 'components/UI/GoBackButton';
import clHistory from 'utils/cl-router/history';

export default function index(): ReactElement {
  function goBack() {
    clHistory.push('/admin/ideas/statuses');
  }

  return (
    <div>
      <GoBackButton onClick={goBack} />
    </div>
  );
}
