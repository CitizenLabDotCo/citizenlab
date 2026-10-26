import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Modal from 'components/UI/Modal';

// A self-contained "Start from a template" gallery for the prototype.
//
// Why this exists: the real gallery (the `admin_project_templates` module) loads
// its cards from a separate GraphQL service at `/admin_templates_api/graphql`,
// which isn't populated on staging / the epic preview, so it renders empty. That
// gallery is also being deprecated. Rather than revive it, we show a faithful
// static gallery here.
//
// prototype data — template names + descriptions below were captured from the
// live gallery on irenesdemo.govocal.com in ENGLISH on 2026-10-26. They are
// English-only: the real gallery localises this copy, so for any other locale
// the titles/descriptions here must be re-captured or translated. (The card art
// in the real gallery is served over HTTP from an internal host and can't be
// embedded on an HTTPS page, so each card is rebuilt here as a coloured block +
// glyph instead of the original thumbnail image.)
type Template = {
  title: string;
  description: string;
  color: string;
  glyph: string;
};

const TEMPLATES: Template[] = [
  {
    title: 'Spatial plan',
    description:
      'Collect contributions regarding your new spatial plan and allow your citizens to prioritise them.',
    color: '#E8604C',
    glyph: '🏙️',
  },
  {
    title: 'Collect ideas on a map',
    description: 'Let your citizens pin their ideas on a map.',
    color: '#1F9EAD',
    glyph: '🗺️',
  },
  {
    title: 'Polling',
    description: 'Take the pulse of public opinion on a specific topic.',
    color: '#3DB66F',
    glyph: '🗳️',
  },
  {
    title: 'Mobility Plan',
    description: 'Involve citizens in the elaboration of a mobility plan.',
    color: '#F07E26',
    glyph: '🚲',
  },
  {
    title: 'Prioritisation of ideas',
    description:
      'Collect contributions and allow your citizens to prioritise them.',
    color: '#1C4E6B',
    glyph: '💡',
  },
  {
    title: 'Scenario planning',
    description: 'Let your citizens debate over different scenarios.',
    color: '#F0B429',
    glyph: '🔀',
  },
  {
    title: 'Online Citizen Panel',
    description:
      'Send a representative group of residents a series of questions about subjects that play a role in your city, and repeat that every quarter.',
    color: '#2BB392',
    glyph: '👥',
  },
  {
    title: 'Neighbourhood budget',
    description: 'Make citizens divide a budget over a list of projects.',
    color: '#F0B429',
    glyph: '💶',
  },
  {
    title: 'Cultural Master Plan',
    description: 'Involve citizens in the elaboration of your cultural plan.',
    color: '#E8342B',
    glyph: '🎭',
  },
];

const Card = styled.button`
  appearance: none;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0;
  border: 1px solid ${colors.grey200};
  border-radius: 12px;
  overflow: hidden;
  background: ${colors.white};
  cursor: pointer;
  transition: box-shadow 120ms ease, border-color 120ms ease,
    transform 120ms ease;
  &:hover {
    border-color: ${colors.grey400};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const SearchInput = styled.input`
  width: 280px;
  max-width: 100%;
  font-family: inherit;
  font-size: 14px;
  padding: 9px 36px 9px 14px;
  border-radius: 999px;
  border: 1px solid ${colors.grey300};
  background: ${colors.white};
  color: ${colors.textPrimary};
  &::placeholder {
    color: ${colors.grey600};
  }
  &:focus {
    outline: none;
    border-color: ${colors.teal400};
    box-shadow: 0 0 0 3px ${colors.teal100};
  }
`;

type Props = {
  opened: boolean;
  onClose: () => void;
  // What "Use template" does. In the prototype this hands off to another create
  // flow (e.g. the blank builder); wire to real template application later.
  onUseTemplate: (template: Template) => void;
};

const TemplateGallery = ({ opened, onClose, onUseTemplate }: Props) => {
  const [query, setQuery] = useState('');

  const matches = TEMPLATES.filter((template) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      template.title.toLowerCase().includes(q) ||
      template.description.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={1000}
      ariaLabelledBy="start-from-template-title"
    >
      <Box p="28px 32px 32px">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="12px"
          mb="20px"
        >
          <Text
            id="start-from-template-title"
            m="0px"
            fontSize="xl"
            fontWeight="bold"
            color="textPrimary"
          >
            Start from a template
          </Text>
          <Box position="relative" display="flex" alignItems="center">
            <SearchInput
              type="text"
              value={query}
              placeholder="Search the templates"
              onChange={(e) => setQuery(e.target.value)}
            />
            <Box position="absolute" right="12px" display="flex" alignItems="center">
              <Icon name="search" width="16px" height="16px" fill={colors.grey600} />
            </Box>
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {matches.map((template) => (
            <Card
              key={template.title}
              type="button"
              onClick={() => onUseTemplate(template)}
            >
              <Box
                height="96px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ background: template.color }}
              >
                <span style={{ fontSize: '40px', lineHeight: 1 }} aria-hidden>
                  {template.glyph}
                </span>
              </Box>
              <Box p="16px 18px 20px">
                <Text m="0 0 6px" fontSize="l" fontWeight="bold" color="textPrimary">
                  {template.title}
                </Text>
                <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.45">
                  {template.description}
                </Text>
              </Box>
            </Card>
          ))}
        </Box>

        {matches.length === 0 && (
          <Text m="24px 0 0" color="textSecondary">
            No templates match “{query}”.
          </Text>
        )}
      </Box>
    </Modal>
  );
};

export default TemplateGallery;
