import React from 'react';

import PanelGroupHeader from 'design-system/PanelGroupHeader';
import 'design-system/tokens.css';

interface Props {
  label: string;
}

const PanelHeading = ({ label }: Props) => <PanelGroupHeader label={label} />;

export default PanelHeading;
