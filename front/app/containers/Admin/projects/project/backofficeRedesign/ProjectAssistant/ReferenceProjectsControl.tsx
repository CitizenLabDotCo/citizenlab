import React, { useState } from 'react';

import { Box, Icon, IconButton, Text, colors } from '@citizenlab/cl2-component-library';

import useProjects from 'api/projects/useProjects';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

// A reference project is pulled in as *context* for the draft — the engine
// reads its title + summary the same way it reads an attached PDF or the
// intake answers, so a manager can say "make one like these".
export type ReferenceProject = {
  id: string;
  title: string;
  description: string;
};

interface Props {
  selected: ReferenceProject[];
  onChange: (next: ReferenceProject[]) => void;
  excludeProjectId: string;
  disabled?: boolean;
}

const ReferenceProjectsControl = ({
  selected,
  onChange,
  excludeProjectId,
  disabled,
}: Props) => {
  const localize = useLocalize();
  const [open, setOpen] = useState(false);
  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'archived', 'draft'],
    canModerate: true,
    pageSize: 250,
  });

  const options = (projects?.data ?? []).filter(
    (project) => project.id !== excludeProjectId
  );
  const isSelected = (id: string) => selected.some((item) => item.id === id);

  const toggle = (project: IProjectData) => {
    if (isSelected(project.id)) {
      onChange(selected.filter((item) => item.id !== project.id));
      return;
    }
    onChange([
      ...selected,
      {
        id: project.id,
        title: localize(project.attributes.title_multiloc),
        description: localize(project.attributes.description_preview_multiloc),
      },
    ]);
  };

  return (
    <Box>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          border: `1px solid ${colors.grey300}`,
          borderRadius: '8px',
          background: colors.white,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <Icon name="plus" width="14px" height="14px" fill={colors.grey700} />
        <Text m="0px" fontSize="s" color="textSecondary">
          Add existing projects as context
        </Text>
      </button>

      {open && (
        <Box
          mt="4px"
          maxHeight="220px"
          overflowY="auto"
          border={`1px solid ${colors.grey200}`}
          borderRadius="8px"
          background={colors.white}
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          {options.length === 0 ? (
            <Text m="0px" p="12px" fontSize="s" color="textSecondary">
              No other projects to reference yet.
            </Text>
          ) : (
            options.map((project) => {
              const picked = isSelected(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => toggle(project)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    borderBottom: `1px solid ${colors.grey100}`,
                    background: picked ? colors.teal50 : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Box flex="0 0 16px" width="16px" height="16px">
                    {picked && (
                      <Icon
                        name="check-circle"
                        width="16px"
                        height="16px"
                        fill={colors.teal500}
                      />
                    )}
                  </Box>
                  <Text
                    m="0px"
                    fontSize="s"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                  >
                    {localize(project.attributes.title_multiloc)}
                  </Text>
                </button>
              );
            })
          )}
        </Box>
      )}

      {selected.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap="6px" mt="8px">
          {selected.map((item) => (
            <Box
              key={item.id}
              display="flex"
              alignItems="center"
              gap="6px"
              pl="10px"
              py="2px"
              bgColor={colors.teal50}
              border={`1px solid ${colors.teal100}`}
              borderRadius="8px"
              maxWidth="100%"
            >
              <Icon
                name="stars"
                width="14px"
                height="14px"
                fill={colors.teal500}
              />
              <Text
                m="0px"
                fontSize="s"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                maxWidth="160px"
              >
                {item.title}
              </Text>
              <IconButton
                iconName="close"
                buttonType="button"
                iconWidth="14px"
                iconHeight="14px"
                iconColor={colors.grey700}
                iconColorOnHover={colors.textPrimary}
                a11y_buttonActionMessage={`Remove ${item.title}`}
                onClick={() => onChange(selected.filter((s) => s.id !== item.id))}
                disabled={disabled}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ReferenceProjectsControl;
