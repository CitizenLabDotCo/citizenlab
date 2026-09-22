import React, { KeyboardEvent, useId, useRef, useState } from 'react';

import { Box, IconNames, colors } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { MessageDescriptor } from 'utils/cl-intl';

import NavItem from './NavItem';

export interface SettingsModalSection {
  name: string;
  label: MessageDescriptor;
  icon: IconNames;
  content: React.ReactNode;
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
  width = 'min(866px, 94vw)',
}: Props) => {
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
      width={width}
      fixedHeight
    >
      <Box display="flex" h="100%">
        <Box
          ref={navRef}
          role="tablist"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          display="flex"
          flexDirection="column"
          gap="3px"
          flex="0 0 auto"
          w="210px"
          py="16px"
          px="12px"
          background={colors.grey50}
          borderRight={`1px solid ${colors.grey200}`}
          overflowY="auto"
        >
          {sections.map(({ name, label, icon }, index) => (
            <NavItem
              key={name}
              tabId={tabId(name)}
              panelId={panelId(name)}
              label={label}
              icon={icon}
              selected={index === selectedIndex}
              onSelect={() => select(index)}
            />
          ))}
        </Box>
        <Box
          key={section.name}
          role="tabpanel"
          id={panelId(section.name)}
          aria-labelledby={tabId(section.name)}
          tabIndex={0}
          flex="1 1 auto"
          pt="32px"
          px="32px"
          pb="24px"
          overflowY="auto"
        >
          {section.content}
        </Box>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
