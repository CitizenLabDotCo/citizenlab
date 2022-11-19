import React from 'react';

// components
import Tabs, { ITabItem } from 'components/UI/Tabs';

// styling
import styled from 'styled-components';

const TAB_ITEMS: ITabItem[] = [
  { icon: 'chart-bar', name: 'chart', label: '' },
  { icon: 'list', name: 'table', label: '' },
];

const StyledTabs = styled(Tabs)`
  button {
    padding: 10px;
  }
  svg {
    margin-left: 0px;
  }
`;

export type View = 'chart' | 'table';

export interface Props {
  view: View;
  onChangeView: (view: View) => void;
}

const ViewToggle = ({ view, onChangeView }: Props) => (
  <StyledTabs items={TAB_ITEMS} selectedValue={view} onClick={onChangeView} />
);

export default ViewToggle;
