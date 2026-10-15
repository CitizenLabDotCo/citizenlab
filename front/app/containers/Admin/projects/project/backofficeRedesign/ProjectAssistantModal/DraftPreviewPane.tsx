import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import {
  DRAFT_AREA,
  DRAFT_DESCRIPTION,
  DRAFT_TAGS,
  DRAFT_TITLE,
  DraftPhase,
  SPOTLIGHT_PHASE,
  TIMELINE_MONTHS,
  TIMELINE_PHASES,
} from './script';

// The right half of the assistant modal: what the assistant drafted, shown the
// way a manager will see it. A Draft / Preview toggle switches between the
// structured draft (this file) and a resident's-eye preview (a simple framed
// view), mirroring the augur prototype.

const Pill = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  color: ${({ $active }) => ($active ? colors.textPrimary : colors.textSecondary)};
  background: ${({ $active }) => ($active ? colors.white : 'transparent')};
  box-shadow: ${({ $active }) =>
    $active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'};
`;

const Tag = ({ icon, label }: { icon: 'map-tag' | 'tag'; label: string }) => (
  <Box
    display="inline-flex"
    alignItems="center"
    gap="6px"
    px="10px"
    py="4px"
    borderRadius="8px"
    bgColor={colors.teal50}
  >
    <Icon
      name={icon === 'map-tag' ? 'position' : 'label'}
      width="13px"
      height="13px"
      fill={colors.teal500}
    />
    <Text m="0px" fontSize="s" color="textPrimary">
      {label}
    </Text>
  </Box>
);

const PhaseRow = ({
  phase,
  showMonths,
}: {
  phase: DraftPhase;
  showMonths?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Box py="16px">
      <Box display="flex" gap="14px" alignItems="flex-start">
        <Box
          flex="0 0 auto"
          width="36px"
          height="36px"
          borderRadius="8px"
          bgColor={colors.grey100}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name={phase.icon} width="18px" height="18px" fill={colors.grey700} />
        </Box>

        <Box flex="1" minWidth="0">
          <Text m="0px" fontWeight="bold" color="textPrimary" lineHeight="1.3">
            {phase.title}
          </Text>
          <Text m="2px 0 0" fontSize="s" color="textSecondary">
            {phase.method} · {phase.dates}
          </Text>
          <Text m="8px 0 0" color="textSecondary" lineHeight="1.45">
            {phase.description}
          </Text>

          {phase.questions && (
            <Box mt="12px">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${open ? colors.teal400 : colors.grey300}`,
                  background: colors.white,
                  color: colors.textPrimary,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {phase.questions.length} questions
                <Icon
                  name={open ? 'chevron-up' : 'chevron-down'}
                  width="13px"
                  height="13px"
                  fill={colors.textPrimary}
                />
              </button>

              {open && (
                <Box
                  mt="10px"
                  border={`1px solid ${colors.grey200}`}
                  borderRadius="10px"
                  overflow="hidden"
                >
                  {phase.questions.map((q, i) => (
                    <Box
                      key={i}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap="12px"
                      p="12px 14px"
                      borderTop={i === 0 ? undefined : `1px solid ${colors.grey200}`}
                    >
                      <Box display="flex" gap="12px" minWidth="0">
                        <Text m="0px" color="textSecondary" flex="0 0 auto">
                          {i + 1}
                        </Text>
                        <Text m="0px" color="textPrimary">
                          {q.label}
                        </Text>
                      </Box>
                      <Box
                        flex="0 0 auto"
                        px="10px"
                        py="4px"
                        borderRadius="8px"
                        bgColor={colors.grey100}
                      >
                        <Text m="0px" fontSize="s" color="textSecondary">
                          {q.type}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Mini gantt bar on the right, like the real timeline. */}
        <Box flex="0 0 32%" display="flex" flexDirection="column" gap="6px">
          {showMonths && (
            <Box display="flex" justifyContent="space-between">
              {TIMELINE_MONTHS.map((m) => (
                <Text key={m} m="0px" fontSize="s" color="textSecondary">
                  {m}
                </Text>
              ))}
            </Box>
          )}
          <Box
            position="relative"
            width="100%"
            height="6px"
            borderRadius="3px"
            bgColor={colors.grey100}
          >
            <Box
              position="absolute"
              top="0px"
              height="6px"
              borderRadius="3px"
              bgColor={colors.grey400}
              style={{ left: phase.barLeft, width: phase.barWidth }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <Box
    bgColor={colors.white}
    border={`1px solid ${colors.grey200}`}
    borderRadius="14px"
    p="20px 24px"
  >
    {children}
  </Box>
);

const DraftView = () => (
  <Box display="flex" flexDirection="column" gap="28px">
    <Box>
      <Text m="0 0 14px" fontSize="l" fontWeight="bold" color="textPrimary">
        Project setup
      </Text>
      <SectionCard>
        <Box display="flex" gap="24px">
          {/* Image placeholder — a soft streetscape wash stands in for the
              generated project image. */}
          <Box
            flex="0 0 220px"
            height="150px"
            borderRadius="10px"
            style={{
              background:
                'linear-gradient(135deg, #b9cbb0 0%, #8aa98c 45%, #6b7f74 100%)',
            }}
          />
          <Box flex="1" minWidth="0">
            <Text m="0px" fontSize="s" color="textSecondary">
              Project page and homepage card
            </Text>
            <Text
              m="6px 0 0"
              fontSize="xl"
              fontWeight="bold"
              color="textPrimary"
              lineHeight="1.2"
            >
              {DRAFT_TITLE}
            </Text>
            <Text m="10px 0 0" color="textSecondary" lineHeight="1.5">
              {DRAFT_DESCRIPTION}
            </Text>

            <Box
              mt="16px"
              pt="16px"
              borderTop={`1px solid ${colors.grey200}`}
              display="flex"
              flexDirection="column"
              gap="12px"
            >
              <Box display="flex" alignItems="center" gap="16px">
                <Text m="0px" fontSize="s" color="textSecondary" flex="0 0 70px">
                  Area
                </Text>
                <Tag icon="map-tag" label={DRAFT_AREA} />
              </Box>
              <Box display="flex" alignItems="center" gap="16px">
                <Text m="0px" fontSize="s" color="textSecondary" flex="0 0 70px">
                  Topic tags
                </Text>
                <Box display="flex" flexWrap="wrap" gap="8px">
                  {DRAFT_TAGS.map((t) => (
                    <Tag key={t} icon="tag" label={t} />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </SectionCard>
    </Box>

    <Box>
      <Text m="0 0 14px" fontSize="l" fontWeight="bold" color="textPrimary">
        Participation methods
      </Text>
      <SectionCard>
        <Text m="0 0 4px" fontSize="s" color="textSecondary" fontWeight="bold">
          Timeline
        </Text>
        {TIMELINE_PHASES.map((phase, i) => (
          <Box
            key={phase.title}
            borderTop={i === 0 ? undefined : `1px solid ${colors.grey200}`}
          >
            <PhaseRow phase={phase} showMonths={i === 0} />
          </Box>
        ))}

        <Box mt="8px" pt="8px" borderTop={`1px solid ${colors.grey200}`}>
          <Text m="0 0 4px" fontSize="s" color="textSecondary" fontWeight="bold">
            Spotlight
          </Text>
          <PhaseRow phase={SPOTLIGHT_PHASE} />
        </Box>
      </SectionCard>
    </Box>
  </Box>
);

// A light resident's-eye preview — the project page as it will read on a phone.
const PreviewView = () => (
  <Box display="flex" justifyContent="center" pt="12px">
    <Box
      width="360px"
      bgColor={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius="20px"
      overflow="hidden"
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
    >
      <Box
        height="180px"
        style={{
          background:
            'linear-gradient(135deg, #b9cbb0 0%, #8aa98c 45%, #6b7f74 100%)',
        }}
      />
      <Box p="20px">
        <Text m="0px" fontSize="xl" fontWeight="bold" color="textPrimary" lineHeight="1.2">
          {DRAFT_TITLE}
        </Text>
        <Text m="12px 0 0" color="textSecondary" lineHeight="1.5">
          {DRAFT_DESCRIPTION}
        </Text>
        <Box
          mt="18px"
          p="12px"
          borderRadius="10px"
          bgColor={colors.teal50}
          textAlign="center"
        >
          <Text m="0px" fontWeight="bold" color="teal700">
            Submit your idea
          </Text>
        </Box>
      </Box>
    </Box>
  </Box>
);

const DraftPreviewPane = () => {
  const [tab, setTab] = useState<'draft' | 'preview'>('draft');
  return (
    <Box display="flex" flexDirection="column" height="100%" minHeight="0">
      <Box display="flex" justifyContent="center" py="16px" flex="0 0 auto">
        <Box display="flex" gap="4px" p="4px" borderRadius="999px" bgColor={colors.grey100}>
          <Pill $active={tab === 'draft'} onClick={() => setTab('draft')}>
            Draft
          </Pill>
          <Pill $active={tab === 'preview'} onClick={() => setTab('preview')}>
            Preview
          </Pill>
        </Box>
      </Box>

      <Box flex="1" minHeight="0" overflowY="auto" px="32px" pb="24px">
        {tab === 'draft' ? <DraftView /> : <PreviewView />}
      </Box>
    </Box>
  );
};

export default DraftPreviewPane;
