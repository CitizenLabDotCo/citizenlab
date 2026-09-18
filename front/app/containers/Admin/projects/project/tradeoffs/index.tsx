import React, { useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Icon,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import DecisionBuilder from './components/DecisionBuilder';
import MapLegend from './components/MapLegend';
import RelationEditor from './components/RelationEditor';
import RelationMatrix from './components/RelationMatrix';
import ReviewQueue from './components/ReviewQueue';
import SegmentedControl from './components/SegmentedControl';
import StatementList from './components/StatementList';
import TradeoffMap from './components/TradeoffMap';
import { DEMO_RELATIONS, DEMO_STATEMENTS, DEMO_TOPIC } from './demoData';
import messages from './messages';
import { Pair, Relation, RelationKind, WeightMode } from './types';
import { buildLookup } from './utils/display';
import {
  bestCompletion,
  blockedBy,
  evaluatePackage,
  findRelation,
  indexRelations,
  marginalEffect,
  pairKey,
  suggestPackages,
  topByWeight,
  weightFor,
} from './utils/solver';

type View = 'map' | 'matrix' | 'list';

const SUGGESTION_COUNT = 3;
const NAIVE_COUNT = 6;

const AdminPhaseTradeoffs = () => {
  const { formatMessage } = useIntl();
  const statements = DEMO_STATEMENTS;

  const [relations, setRelations] =
    useState<readonly Relation[]>(DEMO_RELATIONS);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [weightMode, setWeightMode] = useState<WeightMode>('both');
  const [view, setView] = useState<View>('map');
  const [activePair, setActivePair] = useState<Pair | undefined>();

  const weightOf = useMemo(() => weightFor(weightMode), [weightMode]);
  const lookup = useMemo(() => buildLookup(statements), [statements]);
  const relationIndex = useMemo(() => indexRelations(relations), [relations]);

  const evaluation = useMemo(
    () => evaluatePackage(selectedIds, statements, relations, weightOf),
    [selectedIds, statements, relations, weightOf]
  );
  const blocked = useMemo(
    () => blockedBy(selectedIds, relations),
    [selectedIds, relations]
  );
  const suggestions = useMemo(
    () =>
      suggestPackages(statements, relations, weightOf, {
        count: SUGGESTION_COUNT,
      }),
    [statements, relations, weightOf]
  );
  const completion = useMemo(
    () => bestCompletion(selectedIds, statements, relations, weightOf),
    [selectedIds, statements, relations, weightOf]
  );
  const naive = useMemo(
    () =>
      evaluatePackage(
        topByWeight(statements, weightOf, NAIVE_COUNT),
        statements,
        relations,
        weightOf
      ),
    [statements, relations, weightOf]
  );

  const toggleStatement = (id: string) => {
    setSelectedIds(
      marginalEffect(id, selectedIds, statements, relations, weightOf).resulting
    );
  };

  const setRelationKind = (pair: Pair, kind: RelationKind) => {
    const key = pairKey(pair[0], pair[1]);
    const existing = relationIndex.get(key);
    const [a, b] = pair[0] < pair[1] ? pair : [pair[1], pair[0]];
    const updated: Relation = existing
      ? { ...existing, kind, source: 'admin', confirmed: true, confidence: 1 }
      : {
          a,
          b,
          kind,
          source: 'admin',
          confirmed: true,
          confidence: 1,
          rationale: '',
        };
    setRelations(
      existing
        ? relations.map((relation) =>
            pairKey(relation.a, relation.b) === key ? updated : relation
          )
        : [...relations, updated]
    );
  };

  const confirmRelation = (pair: Pair) => {
    const key = pairKey(pair[0], pair[1]);
    setRelations(
      relations.map((relation) =>
        pairKey(relation.a, relation.b) === key
          ? { ...relation, confirmed: true }
          : relation
      )
    );
  };

  const activeRelation = activePair
    ? findRelation(relationIndex, activePair[0], activePair[1])
    : undefined;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="20px"
      data-cy="tradeoffs-page"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap="24px"
      >
        <Box>
          <Box display="flex" alignItems="center" gap="8px">
            <Title variant="h2" as="h1" color="textPrimary" m="0px">
              <FormattedMessage {...messages.title} />
            </Title>
            <Badge color={colors.orange500} className="inverse">
              {formatMessage(messages.experimental)}
            </Badge>
          </Box>
          <Text fontSize="s" color="textSecondary" m="0" mt="4px">
            <FormattedMessage {...messages.subtitle} />
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-end"
          gap="4px"
        >
          <Text m="0" fontSize="xs" color="textSecondary">
            <FormattedMessage {...messages.weightBy} />
          </Text>
          <SegmentedControl<WeightMode>
            ariaLabel={formatMessage(messages.weightBy)}
            value={weightMode}
            onChange={setWeightMode}
            options={[
              { value: 'votes', label: formatMessage(messages.weightVotes) },
              { value: 'likes', label: formatMessage(messages.weightLikes) },
              { value: 'both', label: formatMessage(messages.weightBoth) },
            ]}
          />
        </Box>
      </Box>

      <Box
        display="flex"
        gap="10px"
        alignItems="flex-start"
        p="10px 12px"
        bgColor={colors.orange100}
        borderRadius="3px"
      >
        <Icon
          name="info-outline"
          fill={colors.orange500}
          width="18px"
          height="18px"
        />
        <Box>
          <Text m="0" fontSize="xs" color="textPrimary">
            {formatMessage(messages.demoNotice, { topic: DEMO_TOPIC })}
          </Text>
          <Text m="0" mt="2px" fontSize="xs" color="textSecondary">
            <FormattedMessage {...messages.intro} />
          </Text>
        </Box>
      </Box>

      <Box display="flex" gap="20px" alignItems="flex-start">
        <Box
          flex="1 1 0"
          minWidth="0"
          display="flex"
          flexDirection="column"
          gap="16px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap="16px"
            flexWrap="wrap"
          >
            <SegmentedControl<View>
              ariaLabel={formatMessage(messages.title)}
              value={view}
              onChange={setView}
              options={[
                { value: 'map', label: formatMessage(messages.viewMap) },
                { value: 'matrix', label: formatMessage(messages.viewMatrix) },
                { value: 'list', label: formatMessage(messages.viewList) },
              ]}
            />
            {view !== 'list' && <MapLegend />}
          </Box>

          {view === 'map' && (
            <Box>
              <TradeoffMap
                statements={statements}
                relations={relations}
                lookup={lookup}
                weightOf={weightOf}
                selectedIds={selectedIds}
                blocked={blocked}
                activePair={activePair}
                onToggleStatement={toggleStatement}
                onSelectPair={setActivePair}
              />
              <Text m="0" mt="6px" fontSize="xs" color="textSecondary">
                <FormattedMessage {...messages.mapHint} />
              </Text>
            </Box>
          )}

          {view === 'matrix' && (
            <Box>
              <RelationMatrix
                statements={statements}
                relations={relations}
                lookup={lookup}
                selectedIds={selectedIds}
                blocked={blocked}
                activePair={activePair}
                onSelectPair={setActivePair}
              />
              <Text m="0" mt="6px" fontSize="xs" color="textSecondary">
                <FormattedMessage {...messages.matrixHint} />
              </Text>
            </Box>
          )}

          {view === 'list' && (
            <StatementList
              statements={statements}
              relations={relations}
              lookup={lookup}
              weightOf={weightOf}
              selectedIds={selectedIds}
              blocked={blocked}
              onToggleStatement={toggleStatement}
            />
          )}

          {activePair && (
            <RelationEditor
              pair={activePair}
              relation={activeRelation}
              lookup={lookup}
              onSetKind={setRelationKind}
              onConfirm={confirmRelation}
              onClose={() => setActivePair(undefined)}
            />
          )}

          <ReviewQueue
            relations={relations}
            lookup={lookup}
            activePair={activePair}
            onSelectPair={setActivePair}
          />
        </Box>

        <Box w="360px" flexShrink={0} position="sticky" top="16px">
          <DecisionBuilder
            topic={DEMO_TOPIC}
            statements={statements}
            lookup={lookup}
            weightOf={weightOf}
            evaluation={evaluation}
            blocked={blocked}
            suggestions={suggestions}
            naive={naive}
            completion={completion}
            onRemove={toggleStatement}
            onUsePackage={setSelectedIds}
            onClear={() => setSelectedIds([])}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPhaseTradeoffs;
