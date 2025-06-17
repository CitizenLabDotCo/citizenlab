import React from 'react';

import {
  Box,
  Divider,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Text from 'component-library/components/Text';

import { CommonGroundResultItem } from 'api/common_ground/types';

import T from 'components/T';

import OutcomeBreakdownBar from '../OutcomeBreakdownBar';

interface Props {
  title: string;
  description: string;
  items: CommonGroundResultItem[];
}

const ResultList = ({ title, description, items }: Props) => {
  const isPhone = useBreakpoint('phone');

  return (
    <Box mb="32px">
      <Title variant="h4" mb="4px">
        {title}
      </Title>
      <Text fontSize="s" color="grey700" my="0px">
        {description}
      </Text>
      {items.map((item) => {
        const agreedPercent = Math.round(
          (item.votes.up /
            (item.votes.up + item.votes.down + item.votes.neutral)) *
            100
        );
        const unsurePercent = Math.round(
          (item.votes.neutral /
            (item.votes.up + item.votes.down + item.votes.neutral)) *
            100
        );
        const disagreePercent = Math.round(
          (item.votes.down /
            (item.votes.up + item.votes.down + item.votes.neutral)) *
            100
        );
        const totalCount = item.votes.up + item.votes.down + item.votes.neutral;
        return (
          <React.Fragment key={item.id}>
            <Box py="12px">
              <Box
                display="flex"
                flexDirection={isPhone ? 'column' : 'row'}
                alignItems={isPhone ? 'flex-start' : 'center'}
                justifyContent="space-between"
              >
                <Box
                  width={isPhone ? '100%' : 'calc(100% - 182px)'}
                  mb={isPhone ? '8px' : undefined}
                  mr={isPhone ? undefined : '16px'}
                >
                  <T value={item.title_multiloc} supportHtml />
                </Box>
                <Box width="166px" flexShrink={0}>
                  <OutcomeBreakdownBar
                    agreedPercent={agreedPercent}
                    unsurePercent={unsurePercent}
                    disagreePercent={disagreePercent}
                    totalCount={totalCount}
                  />
                </Box>
              </Box>
            </Box>
            <Divider m="0px" />
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default ResultList;
