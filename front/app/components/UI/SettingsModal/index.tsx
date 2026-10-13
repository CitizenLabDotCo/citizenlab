import React, { KeyboardEvent, useId, useRef, useState } from 'react';

import {
  Box,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import NavItem from './NavItem';

export interface SettingsModalSection {
  name: string;
  label: MessageDescriptor;
  icon: IconNames;
  content: React.ReactNode;
  /** Sections that share a group are listed under its label in the sidebar. */
  group?: MessageDescriptor;
}

interface Props {
  opened: boolean;
  close: () => void;
  header: string | JSX.Element;
  sections: SettingsModalSection[];
  initialSection?: string;
  footer?: JSX.Element;
  width?: number | string;
}

const SettingsModal = ({
  opened,
  close,
  header,
  sections,
  initialSection,
  footer,
  width = 'min(760px, 94vw)',
}: Props) => {
  const { formatMessage } = useIntl();
  const idPrefix = useId();
  const navRef = useRef<HTMLDivElement>(null);
  const [selectedSection, setSelectedSection] = useState(
    initialSection ?? sections[0]?.name
  );

  const selectedIndex = Math.max(
    sections.findIndex(({ name }) => name === selectedSection),
    0
  );

  const select = (index: number) => {
    setSelectedSection(sections[index].name);

    const tabs =
      navRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[index].focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const lastIndex = sections.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        select(selectedIndex === lastIndex ? 0 : selectedIndex + 1);
        break;
      case 'ArrowUp':
        select(selectedIndex === 0 ? lastIndex : selectedIndex - 1);
        break;
      case 'Home':
        select(0);
        break;
      case 'End':
        select(lastIndex);
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  if (sections.length === 0) return null;

  const section = sections[selectedIndex];
  const tabId = (name: string) => `${idPrefix}-tab-${name}`;
  const panelId = (name: string) => `${idPrefix}-panel-${name}`;

  return (
    <Modal
      opened={opened}
      close={close}
      header={header}
      footer={
        footer && (
          <Box w="100%" display="flex" justifyContent="flex-end">
            {footer}
          </Box>
        )
      }
      variant="bo"
      width={width}
      height="590px"
      fillContent
    >
      <Box display="flex" flex="1 1 auto" minHeight="0">
        <Box
          ref={navRef}
          role="tablist"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          display="flex"
          flexDirection="column"
          gap="4px"
          flex="0 0 168px"
          p="8px"
          background={colors.grey50}
          borderRight={`1px solid ${colors.grey200}`}
          overflowY="auto"
        >
          {sections.map(({ name, label, icon, group }, index) => {
            const isFirst = index === 0;
            const startsGroup = group && group !== sections[index - 1]?.group;

            return (
              <React.Fragment key={name}>
                {startsGroup && (
                  <Box
                    px="12px"
                    pt={isFirst ? '8px' : '16px'}
                    pb="4px"
                    mt={isFirst ? '0px' : '12px'}
                    borderTop={
                      isFirst ? undefined : `1px solid ${colors.grey200}`
                    }
                  >
                    <Text variant="boMicro" color="coolGrey500" m="0px">
                      {formatMessage(group)}
                    </Text>
                  </Box>
                )}
                <NavItem
                  tabId={tabId(name)}
                  panelId={panelId(name)}
                  label={label}
                  icon={icon}
                  selected={index === selectedIndex}
                  onSelect={() => select(index)}
                />
              </React.Fragment>
            );
          })}
        </Box>
        <Box
          key={section.name}
          role="tabpanel"
          id={panelId(section.name)}
          aria-labelledby={tabId(section.name)}
          tabIndex={0}
          flex="1 1 auto"
          minWidth="0"
          p="24px"
          overflowY="auto"
        >
          {section.content}
        </Box>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
