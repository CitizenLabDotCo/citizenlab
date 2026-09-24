import React from 'react';

import {
  Box,
  Icon,
  NewBOText,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import { LINKED_SECTIONS } from '../_shared/sections';

const Row = typedStyled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid ${colors.grey200};
  border-radius: ${stylingConsts.borderRadius};
  text-decoration: none;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }
`;

interface Props {
  projectId: string;
}

const SectionLinks = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {LINKED_SECTIONS.map(({ path, label, to }) => (
        <Row key={path} to={to} params={{ projectId }}>
          <NewBOText variant="label" as="span">
            {formatMessage(label)}
          </NewBOText>
          <Icon
            name="chevron-right"
            width="20px"
            height="20px"
            fill={colors.textSecondary}
            my="0px"
          />
        </Row>
      ))}
    </Box>
  );
};

export default SectionLinks;
