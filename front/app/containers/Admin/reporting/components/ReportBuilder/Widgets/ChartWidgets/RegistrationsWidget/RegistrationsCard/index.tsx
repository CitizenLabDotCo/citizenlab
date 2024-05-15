import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { Props } from '../typings';

import Narrow from './Narrow';
import Wide from './Wide';

const RegistrationsCard = (props: Props) => {
  const layout = useLayout();

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default RegistrationsCard;
