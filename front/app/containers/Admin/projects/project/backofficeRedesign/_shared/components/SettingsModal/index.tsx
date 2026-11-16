import React, { useState } from 'react';

import { IconName } from 'design-system/Icon';
import Modal, { DialogAction } from 'design-system/Modal';
import 'design-system/tokens.css';
import VerticalTabs, {
  TabPanel,
  VerticalTab,
  VerticalTabList,
} from 'design-system/VerticalTabs';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import styles from './SettingsModal.module.css';

export interface SettingsModalSection {
  name: string;
  label: MessageDescriptor;
  icon?: IconName;
  content: React.ReactNode;
  group?: MessageDescriptor;
}

interface Props {
  opened: boolean;
  close: () => void;
  header: string | JSX.Element;
  sections: SettingsModalSection[];
  initialSection?: string;
  // Shown above the tabs, e.g. an error after saving.
  notice?: React.ReactNode;
  primaryAction?: DialogAction;
  size?: 866 | 920;
}

// Sections of the same group are pulled together, so a group never shows up
// in two places in the tab list.
const groupSections = (sections: SettingsModalSection[]) =>
  sections
    .reduce<SettingsModalSection[][]>((groups, section) => {
      const existing = groups.find(
        (items) => items[0].group?.id === section.group?.id
      );

      if (existing) {
        existing.push(section);
      } else {
        groups.push([section]);
      }

      return groups;
    }, [])
    .flat();

const SettingsModal = ({
  opened,
  close,
  header,
  sections,
  initialSection,
  notice,
  primaryAction,
  size = 866,
}: Props) => {
  const { formatMessage } = useIntl();
  const [selectedSection, setSelectedSection] = useState(
    initialSection ?? sections[0]?.name
  );

  if (sections.length === 0) return null;

  const orderedSections = groupSections(sections);
  const selected =
    orderedSections.find(({ name }) => name === selectedSection) ??
    orderedSections[0];

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
      title={header}
      size={size}
      primaryAction={primaryAction}
    >
      <div className={styles.frame}>
        {notice && <div className={styles.notice}>{notice}</div>}
        <div className={styles.layout}>
          <VerticalTabs
            style="settings"
            selectedKey={selected.name}
            onSelectionChange={(key) => setSelectedSection(String(key))}
          >
            <VerticalTabList>
              {orderedSections.map(({ name, label, icon }) => (
                <VerticalTab key={name} id={name} icon={icon}>
                  {formatMessage(label)}
                </VerticalTab>
              ))}
            </VerticalTabList>
            {orderedSections.map(({ name, content }) => (
              <TabPanel key={name} id={name}>
                {content}
              </TabPanel>
            ))}
          </VerticalTabs>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
