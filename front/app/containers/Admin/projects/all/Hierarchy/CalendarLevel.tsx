import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import UpsellNudge from '../Calendar/UpsellNudge';

import CalendarChart from './CalendarChart';
import { Level } from './level';

interface Props {
  level: Level;
}

// The calendar comes with its own plan; without it, an offer to upgrade.
const CalendarLevel = ({ level }: Props) => {
  const enabled = useFeatureFlag({ name: 'project_planning_calendar' });
  return enabled ? <CalendarChart level={level} /> : <UpsellNudge />;
};

export default CalendarLevel;
