import React, { cloneElement } from 'react';

interface Props {
  tabs: JSX.Element[];
  tabPanels: JSX.Element[];
}

const TabList = ({ tabs, tabPanels }: Props) => {
  return (
    <div>
      {tabs.map((tab) => {
        return cloneElement(tab, { role: 'tab' });
      })}
      {tabPanels.map((tabPanel) => {
        return cloneElement(tabPanel, { role: 'tabpanel' });
      })}
    </div>
  );
};

export default TabList;
