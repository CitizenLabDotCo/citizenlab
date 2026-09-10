import { planToolRound, TRUNCATION_NOTICE } from './turnHandling';

describe('planToolRound', () => {
  const toolCall = {
    id: 'tu_1',
    name: 'set_source' as const,
    input: { source: 'truncated…' },
  };

  it('executes tool calls on a normal tool_use stop', () => {
    const plan = planToolRound({
      assistant_text: null,
      tool_calls: [toolCall],
      stop_reason: 'tool_use',
    });

    expect(plan.execute).toBe(true);
    expect(plan.autoResults).toEqual([]);
  });

  it('answers truncated tool calls with error results instead of executing', () => {
    const plan = planToolRound({
      assistant_text: null,
      tool_calls: [toolCall],
      stop_reason: 'max_tokens',
    });

    expect(plan.execute).toBe(false);
    expect(plan.autoResults).toEqual([
      { tool_use_id: 'tu_1', content: TRUNCATION_NOTICE, is_error: true },
    ]);
  });

  it('executes normally when max_tokens cut only the text', () => {
    const plan = planToolRound({
      assistant_text: 'cut off mid…',
      tool_calls: [],
      stop_reason: 'max_tokens',
    });

    expect(plan.execute).toBe(true);
  });
});
