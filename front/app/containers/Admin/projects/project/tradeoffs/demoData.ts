import { Relation, Statement } from './types';

// Demo data: "The future of the Market Square".
// Twelve cleaned-up position statements with vote and like counts, and the
// pairwise relations between them. The relations mix confirmed moderator
// annotations, unconfirmed AI suggestions and participant pairwise votes.

export const DEMO_TOPIC = 'The future of the Market Square';

export const DEMO_STATEMENTS: readonly Statement[] = [
  {
    id: 's1',
    title: 'Make the Market Square permanently car-free',
    summary:
      'Close the square to through traffic and remove all surface parking, so the full surface becomes public space.',
    theme: 'Mobility',
    votes: 412,
    likes: 238,
    mergedInputs: 37,
  },
  {
    id: 's2',
    title: 'Keep 40 short-stay parking spots on the square for shoppers',
    summary:
      'Retain a compact parking zone (max. 30 minutes) on the west side so shops stay reachable by car.',
    theme: 'Commerce',
    votes: 287,
    likes: 96,
    mergedInputs: 19,
  },
  {
    id: 's3',
    title: 'Move the Saturday market back onto the square',
    summary:
      'Bring the weekly market back from the ring road to the square, with stalls on the full surface.',
    theme: 'Commerce',
    votes: 198,
    likes: 141,
    mergedInputs: 12,
  },
  {
    id: 's4',
    title: 'Plant a double row of trees along the north and east sides',
    summary:
      'Create shade and cooling with mature trees in permanent planting beds along two sides of the square.',
    theme: 'Greenery',
    votes: 356,
    likes: 312,
    mergedInputs: 41,
  },
  {
    id: 's5',
    title: 'Build an underground car park beneath the square',
    summary:
      'Dig a two-level car park under the square with an entrance on the ring road, replacing surface parking.',
    theme: 'Mobility',
    votes: 241,
    likes: 58,
    mergedInputs: 9,
  },
  {
    id: 's6',
    title: 'Add a central water feature with seating',
    summary:
      'Install a fixed fountain or water mirror in the centre with benches around it.',
    theme: 'Public life',
    votes: 176,
    likes: 190,
    mergedInputs: 22,
  },
  {
    id: 's7',
    title: 'Let cafés extend their terraces onto the square',
    summary:
      'Allow the cafés on the south side to place larger terraces on the square during the day.',
    theme: 'Commerce',
    votes: 222,
    likes: 133,
    mergedInputs: 15,
  },
  {
    id: 's8',
    title: 'Allow deliveries by car only between 6 and 11 in the morning',
    summary:
      'Give shops a delivery window with bollards that lower in the morning and rise at 11.',
    theme: 'Mobility',
    votes: 153,
    likes: 44,
    mergedInputs: 8,
  },
  {
    id: 's9',
    title: 'Run a free shuttle from the ring-road car park',
    summary:
      'A free electric shuttle every 10 minutes between the existing ring-road car park and the square.',
    theme: 'Mobility',
    votes: 267,
    likes: 122,
    mergedInputs: 14,
  },
  {
    id: 's10',
    title: 'Keep the square as one open, flexible event space',
    summary:
      'No fixed installations on the surface, so fairs, concerts and the ice rink can keep using the full square.',
    theme: 'Events',
    votes: 190,
    likes: 79,
    mergedInputs: 17,
  },
  {
    id: 's11',
    title: 'Build a covered bike parking hub at the south edge',
    summary:
      'A covered, lit bike hub for 300 bikes with repair station at the south edge of the square.',
    theme: 'Mobility',
    votes: 301,
    likes: 204,
    mergedInputs: 21,
  },
  {
    id: 's12',
    title: 'Lower the speed limit to 20 km/h on all surrounding streets',
    summary:
      'Make every street around the square a 20 km/h zone with raised crossings.',
    theme: 'Mobility',
    votes: 338,
    likes: 152,
    mergedInputs: 26,
  },
];

export const DEMO_RELATIONS: readonly Relation[] = [
  {
    a: 's1',
    b: 's2',
    kind: 'exclusive',
    confidence: 0.96,
    source: 'admin',
    confirmed: true,
    rationale: 'A car-free square cannot keep 40 parking spots on its surface.',
    participantVotes: { exclusive: 88, additive: 1, neutral: 4 },
  },
  {
    a: 's1',
    b: 's5',
    kind: 'additive',
    confidence: 0.55,
    source: 'ai',
    confirmed: false,
    rationale:
      'An underground car park with an entrance outside the square could replace the surface parking a car-free square removes. Whether the construction site is compatible is unclear.',
    participantVotes: { exclusive: 21, additive: 30, neutral: 12 },
  },
  {
    a: 's1',
    b: 's7',
    kind: 'additive',
    confidence: 0.8,
    source: 'admin',
    confirmed: true,
    rationale: 'Terraces need the surface that car traffic occupies today.',
    participantVotes: { exclusive: 2, additive: 61, neutral: 9 },
  },
  {
    a: 's1',
    b: 's8',
    kind: 'additive',
    confidence: 0.7,
    source: 'ai',
    confirmed: false,
    rationale:
      'A morning delivery window makes a car-free square workable for shops. Some participants read "car-free" as no cars at all.',
    participantVotes: { exclusive: 14, additive: 39, neutral: 8 },
  },
  {
    a: 's1',
    b: 's9',
    kind: 'additive',
    confidence: 0.9,
    source: 'admin',
    confirmed: true,
    rationale:
      'The shuttle compensates for the parking that disappears from the square.',
    participantVotes: { exclusive: 1, additive: 72, neutral: 6 },
  },
  {
    a: 's1',
    b: 's11',
    kind: 'additive',
    confidence: 0.75,
    source: 'admin',
    confirmed: true,
    rationale: 'A bike hub supports the modal shift a car-free square needs.',
  },
  {
    a: 's1',
    b: 's12',
    kind: 'additive',
    confidence: 0.85,
    source: 'admin',
    confirmed: true,
    rationale:
      'Slower surrounding streets keep the diverted traffic from harming the neighbourhood.',
  },
  {
    a: 's2',
    b: 's3',
    kind: 'exclusive',
    confidence: 0.7,
    source: 'ai',
    confirmed: false,
    rationale:
      'The market stalls use the west side where the parking zone would be. Both could work if the market is smaller.',
    participantVotes: { exclusive: 34, additive: 3, neutral: 21 },
  },
  {
    a: 's2',
    b: 's5',
    kind: 'exclusive',
    confidence: 0.58,
    source: 'ai',
    confirmed: false,
    rationale:
      'Both answer the same parking demand. Funding both is unlikely, but they are not physically incompatible.',
    participantVotes: { exclusive: 19, additive: 11, neutral: 25 },
  },
  {
    a: 's2',
    b: 's7',
    kind: 'exclusive',
    confidence: 0.66,
    source: 'ai',
    confirmed: false,
    rationale:
      'Larger terraces and a parking zone compete for the same surface on the south-west corner.',
    participantVotes: { exclusive: 27, additive: 6, neutral: 15 },
  },
  {
    a: 's3',
    b: 's6',
    kind: 'exclusive',
    confidence: 0.52,
    source: 'ai',
    confirmed: false,
    rationale:
      'A central fountain takes the space where the largest market stalls stand. The market could be arranged around it.',
    participantVotes: { exclusive: 16, additive: 9, neutral: 22 },
  },
  {
    a: 's3',
    b: 's9',
    kind: 'additive',
    confidence: 0.72,
    source: 'ai',
    confirmed: false,
    rationale:
      'The shuttle brings market visitors from the ring-road car park.',
  },
  {
    a: 's3',
    b: 's10',
    kind: 'additive',
    confidence: 0.82,
    source: 'admin',
    confirmed: true,
    rationale: 'An open surface is exactly what a weekly market needs.',
    participantVotes: { exclusive: 0, additive: 48, neutral: 7 },
  },
  {
    a: 's4',
    b: 's5',
    kind: 'exclusive',
    confidence: 0.93,
    source: 'admin',
    confirmed: true,
    rationale:
      'Mature trees need deep root zones, which an underground structure makes impossible along those sides.',
    participantVotes: { exclusive: 57, additive: 2, neutral: 5 },
  },
  {
    a: 's4',
    b: 's6',
    kind: 'additive',
    confidence: 0.8,
    source: 'admin',
    confirmed: true,
    rationale:
      'Shade and water together make the square comfortable in summer.',
  },
  {
    a: 's4',
    b: 's10',
    kind: 'exclusive',
    confidence: 0.6,
    source: 'ai',
    confirmed: false,
    rationale:
      'Planting beds reduce the usable event surface. Trees along the edges may leave enough room. Participants mostly see no conflict.',
    participantVotes: { exclusive: 18, additive: 12, neutral: 40 },
  },
  {
    a: 's5',
    b: 's9',
    kind: 'exclusive',
    confidence: 0.65,
    source: 'ai',
    confirmed: false,
    rationale:
      'Both solve the same problem, reaching the square without parking on it. Building both spends twice.',
    participantVotes: { exclusive: 23, additive: 8, neutral: 19 },
  },
  {
    a: 's6',
    b: 's10',
    kind: 'exclusive',
    confidence: 0.88,
    source: 'admin',
    confirmed: true,
    rationale:
      'A fixed water feature in the centre is a permanent installation on the event surface.',
    participantVotes: { exclusive: 51, additive: 3, neutral: 9 },
  },
  {
    a: 's7',
    b: 's10',
    kind: 'exclusive',
    confidence: 0.5,
    source: 'ai',
    confirmed: false,
    rationale:
      'Terraces are removable, so they may only block the event surface during the day.',
    participantVotes: { exclusive: 12, additive: 14, neutral: 31 },
  },
  {
    a: 's9',
    b: 's11',
    kind: 'additive',
    confidence: 0.78,
    source: 'admin',
    confirmed: true,
    rationale: 'Shuttle and bike hub together form the car-free access chain.',
  },
  {
    a: 's11',
    b: 's12',
    kind: 'additive',
    confidence: 0.7,
    source: 'admin',
    confirmed: true,
    rationale: 'Slower streets make cycling to the hub safer.',
  },
];
