import React from 'react';

import {
  Box,
  StatusLabel,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Title,
  Tr,
  colors,
} from '@citizenlab/cl2-component-library';

import { OpinionGroupsAttributes } from 'api/opinion_groups/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import {
  REPRESENTATION_HIGH,
  REPRESENTATION_LOW,
  fieldsByKey,
  formatShare,
} from './utils';

interface Props {
  attributes: OpinionGroupsAttributes;
}

const ParticipationBalance = ({ attributes }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const fields = fieldsByKey(attributes.demographic_fields);
  const threshold = attributes.parameters.privacy_threshold;

  return (
    <Box
      p="16px"
      bgColor="white"
      border={`1px solid ${colors.grey300}`}
      borderRadius="3px"
    >
      <Title variant="h3" m="0" color="textPrimary">
        <FormattedMessage {...messages.balanceTitle} />
      </Title>
      <Text fontSize="xs" color="textSecondary" m="0" mt="4px">
        <FormattedMessage {...messages.balanceSubtitle} />
      </Text>

      {attributes.participation_balance.length === 0 && (
        <Text m="0" mt="12px" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.noDemographics} />
        </Text>
      )}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        }}
        gap="16px"
        mt="12px"
      >
        {attributes.participation_balance.map((balance) => {
          const field = fields.get(balance.field_key);
          if (!field) return null;
          return (
            <Box key={balance.field_key}>
              <Text m="0" mb="4px" fontSize="s" fontWeight="bold">
                {localize(field.title_multiloc)}
              </Text>
              <Table>
                <Thead>
                  <Tr>
                    <Th>{formatMessage(messages.category)}</Th>
                    <Th>{formatMessage(messages.voters)}</Th>
                    <Th>{formatMessage(messages.population)}</Th>
                    <Th>{formatMessage(messages.representation)}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {field.categories.map((category) => {
                    const cell = balance.categories.find(
                      (c) => c.key === category.key
                    );
                    if (!cell) return null;
                    const index = cell.index;
                    const status =
                      index === null
                        ? null
                        : index <= REPRESENTATION_LOW
                        ? 'under'
                        : index >= REPRESENTATION_HIGH
                        ? 'over'
                        : 'balanced';
                    return (
                      <Tr key={category.key}>
                        <Td>{localize(category.title_multiloc)}</Td>
                        <Td>
                          {cell.suppressed
                            ? formatMessage(messages.hiddenSmallGroup, {
                                threshold,
                              })
                            : formatShare(cell.voters_share)}
                        </Td>
                        <Td>{formatShare(cell.population_share)}</Td>
                        <Td>
                          {status === 'under' && (
                            <StatusLabel
                              text={formatMessage(
                                messages.underRepresentedLabel
                              )}
                              backgroundColor={colors.orange500}
                            />
                          )}
                          {status === 'over' && (
                            <StatusLabel
                              text={formatMessage(
                                messages.overRepresentedLabel
                              )}
                              backgroundColor={colors.teal500}
                            />
                          )}
                          {status === 'balanced' && (
                            <StatusLabel
                              text={formatMessage(messages.balancedLabel)}
                              backgroundColor={colors.grey500}
                            />
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ParticipationBalance;
