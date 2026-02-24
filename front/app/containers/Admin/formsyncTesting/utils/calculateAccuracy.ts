// Accuracy calculation for formsync benchmark evaluation.
// Matches questions by printed question number (id), with text-based fallback.

const COMPARED_FIELDS = ['options', 'answer'] as const;

const SET_ANSWER_TYPES = ['multiselect'];
const ORDERED_ARRAY_ANSWER_TYPES = ['ranking'];
const HASH_ANSWER_TYPES = ['matrix_linear_scale'];
const NUMERIC_ANSWER_TYPES = [
  'linear_scale',
  'rating',
  'sentiment_linear_scale',
];

export interface QuestionComparison {
  id: string;
  type: string | null;
  text: string;
  fields: Record<string, number>;
  score: number;
  matched: boolean;
  ground_truth: Record<string, any>;
  model_output: Record<string, any> | null;
}

interface TypeResult {
  score: number;
  count: number;
}

export interface AccuracyResult {
  overall_score: number;
  total_fields: number;
  matched_fields: number;
  by_question: QuestionComparison[];
  by_type: Record<string, TypeResult>;
}

// Overrides map: "questionId:field" → true
export type Overrides = Record<string, boolean>;

function normalize(value: any): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\d+[.)]\s*/, '') // strip leading question numbers
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/\(\s+/g, '(') // remove space after (
    .replace(/\s+\)/g, ')'); // remove space before )
}

function normalizeId(value: any): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function isBlank(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function compareText(gt: any, model: any): boolean {
  if (gt == null || model == null) return false;
  return normalize(gt) === normalize(model);
}

function compareNumeric(gt: any, model: any): boolean {
  const gtN = Number(gt);
  const modelN = Number(model);
  if (isNaN(gtN) || isNaN(modelN)) return false;
  return Math.abs(gtN - modelN) < Number.EPSILON;
}

function compareSetPartial(gt: any, model: any): number {
  if (!Array.isArray(gt) || !Array.isArray(model)) return 0;
  if (gt.length === 0 && model.length === 0) return 1;
  if (gt.length === 0) return 0;

  const modelNormalized = new Set(model.map((v: any) => normalize(v)));
  const matched = gt.filter((v: any) =>
    modelNormalized.has(normalize(v))
  ).length;
  return matched / gt.length;
}

function compareOrderedArrayPartial(gt: any, model: any): number {
  if (!Array.isArray(gt) || !Array.isArray(model)) return 0;
  if (gt.length === 0 && model.length === 0) return 1;
  if (gt.length === 0) return 0;

  const maxLen = Math.max(gt.length, model.length);
  let matched = 0;
  for (let i = 0; i < gt.length; i++) {
    if (i < model.length && normalize(gt[i]) === normalize(model[i])) {
      matched++;
    }
  }
  return matched / maxLen;
}

function compareHashPartial(gt: any, model: any): number {
  if (
    typeof gt !== 'object' ||
    gt === null ||
    Array.isArray(gt) ||
    typeof model !== 'object' ||
    model === null ||
    Array.isArray(model)
  ) {
    return 0;
  }

  const gtEntries = Object.entries(gt);
  const modelEntries = Object.entries(model);
  if (gtEntries.length === 0 && modelEntries.length === 0) return 1;
  if (gtEntries.length === 0) return 0;

  const gtNormalized: Record<string, number> = {};
  for (const [k, v] of gtEntries) {
    gtNormalized[normalize(k)] = Number(v);
  }

  const modelNormalized: Record<string, number> = {};
  for (const [k, v] of modelEntries) {
    modelNormalized[normalize(k)] = Number(v);
  }

  let matched = 0;
  for (const [k, v] of Object.entries(gtNormalized)) {
    if (
      k in modelNormalized &&
      Math.abs(v - modelNormalized[k]) < Number.EPSILON
    ) {
      matched++;
    }
  }

  return matched / Object.keys(gtNormalized).length;
}

function compareAnswer(
  gtVal: any,
  modelVal: any,
  questionType: string | null
): number {
  if (isBlank(gtVal)) return isBlank(modelVal) ? 1.0 : 0.0;
  if (isBlank(modelVal)) return 0.0;

  if (NUMERIC_ANSWER_TYPES.includes(questionType ?? '')) {
    return compareNumeric(gtVal, modelVal) ? 1.0 : 0.0;
  }
  if (SET_ANSWER_TYPES.includes(questionType ?? '')) {
    return compareSetPartial(gtVal, modelVal);
  }
  if (ORDERED_ARRAY_ANSWER_TYPES.includes(questionType ?? '')) {
    return compareOrderedArrayPartial(gtVal, modelVal);
  }
  if (HASH_ANSWER_TYPES.includes(questionType ?? '')) {
    return compareHashPartial(gtVal, modelVal);
  }
  return compareText(gtVal, modelVal) ? 1.0 : 0.0;
}

type QuestionHash = Record<string, any>;

// Build indexes for matching: by id and by text
function buildIndexes(questions: QuestionHash[]) {
  const byId: Record<string, QuestionHash> = {};
  const byText: Record<string, QuestionHash> = {};

  for (const q of questions) {
    if (typeof q !== 'object') continue;

    if (q.id != null) {
      const key = normalizeId(q.id);
      if (!(key in byId)) {
        byId[key] = q;
      }
    }

    if (q.text) {
      const key = normalize(q.text);
      if (!(key in byText)) {
        byText[key] = q;
      }
    }
  }

  return { byId, byText };
}

function findModelQuestion(
  gtQ: QuestionHash,
  modelById: Record<string, QuestionHash>,
  modelByText: Record<string, QuestionHash>
): QuestionHash | null {
  // 1. Match by id (printed question number)
  if (gtQ.id != null) {
    const idKey = normalizeId(gtQ.id);
    if (idKey in modelById) return modelById[idKey];
  }

  // 2. Exact text match
  if (gtQ.text) {
    const textKey = normalize(gtQ.text);
    if (textKey in modelByText) return modelByText[textKey];

    // 3. Substring containment fallback
    for (const q of Object.values(modelByText)) {
      const modelNorm = normalize(q.text);
      if (modelNorm.includes(textKey) || textKey.includes(modelNorm)) {
        return q;
      }
    }
  }

  return null;
}

function compareQuestion(
  gtQ: QuestionHash,
  modelById: Record<string, QuestionHash>,
  modelByText: Record<string, QuestionHash>
): QuestionComparison {
  if (typeof gtQ !== 'object' || gtQ === null) {
    return {
      id: '0',
      type: null,
      text: String(gtQ),
      fields: {},
      score: 0,
      matched: false,
      ground_truth: gtQ,
      model_output: null,
    };
  }

  const gtId = String(gtQ.id ?? '0');
  const gtText = gtQ.text ?? '';
  const modelQ = findModelQuestion(gtQ, modelById, modelByText);

  const fields: Record<string, number> = {};

  if (!modelQ) {
    for (const field of COMPARED_FIELDS) {
      if (field in gtQ) {
        fields[field] = 0.0;
      }
    }
  } else {
    const gtType = gtQ.type ?? null;

    if ('options' in gtQ) {
      fields['options'] = compareSetPartial(gtQ.options, modelQ.options);
    }

    fields['answer'] = compareAnswer(gtQ.answer, modelQ.answer, gtType);
  }

  const fieldValues = Object.values(fields);
  const score =
    fieldValues.length > 0
      ? fieldValues.reduce((a, b) => a + b, 0) / fieldValues.length
      : 0;

  return {
    id: gtId,
    type: gtQ.type ?? null,
    text: gtText,
    fields,
    score: Math.round(score * 10000) / 10000,
    matched: modelQ !== null,
    ground_truth: gtQ,
    model_output: modelQ,
  };
}

export function calculateAccuracy(
  groundTruth: QuestionHash[],
  modelOutput: QuestionHash[],
  overrides: Overrides = {}
): AccuracyResult {
  const { byId: modelById, byText: modelByText } = buildIndexes(modelOutput);

  const byQuestion = groundTruth.map((gtQ) =>
    compareQuestion(gtQ, modelById, modelByText)
  );

  // Apply overrides and recalculate per-question scores
  for (const q of byQuestion) {
    let hasOverride = false;
    for (const field of Object.keys(q.fields)) {
      const key = `${q.id}:${field}`;
      if (overrides[key]) {
        q.fields[field] = 1.0;
        hasOverride = true;
      }
    }
    if (hasOverride) {
      const vals = Object.values(q.fields);
      q.score =
        vals.length > 0
          ? Math.round(
              (vals.reduce((a, b) => a + b, 0) / vals.length) * 10000
            ) / 10000
          : 0;
    }
  }

  const totalFields = byQuestion.reduce(
    (sum, q) => sum + Object.keys(q.fields).length,
    0
  );
  const scoreSum = byQuestion.reduce(
    (sum, q) => sum + Object.values(q.fields).reduce((a, b) => a + b, 0),
    0
  );
  const overallScore = totalFields > 0 ? scoreSum / totalFields : 0;

  // By type
  const byType: Record<string, TypeResult> = {};
  for (const q of byQuestion) {
    const type = q.type ?? 'unknown';
    if (!byType[type]) {
      byType[type] = { score: 0, count: 0 };
    }
    byType[type].score += q.score;
    byType[type].count += 1;
  }
  for (const type of Object.keys(byType)) {
    byType[type].score =
      Math.round((byType[type].score / byType[type].count) * 10000) / 10000;
  }

  return {
    overall_score: Math.round(overallScore * 10000) / 10000,
    total_fields: totalFields,
    matched_fields: Math.round(scoreSum * 100) / 100,
    by_question: byQuestion,
    by_type: byType,
  };
}
