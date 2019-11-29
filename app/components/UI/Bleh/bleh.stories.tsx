import React, { FC } from 'react';
import Bleh, { IBleh } from 'components/UI/Bleh';

export default {
  title: 'Bleh',
  component: Bleh
};

export const normal: FC<IBleh> = () => <Bleh text="zolg" />;
