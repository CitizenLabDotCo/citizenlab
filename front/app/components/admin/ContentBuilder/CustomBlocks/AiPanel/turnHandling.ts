import {
  IAiToolResult,
  IAiTurnData,
} from 'api/custom_block_ai_sessions/types';

// Sent back to the model instead of executing tool calls that were cut off by
// the output token limit. Executing a truncated set_source would compile
// garbage and teach the model nothing about the real problem.
export const TRUNCATION_NOTICE =
  'Your tool input was cut off because the reply hit the output token limit. ' +
  'Do not retry the same content: write a more compact file (shorter markup, ' +
  'no long inline data, fewer repeated style props) or split the work into ' +
  'smaller tool calls.';

export interface ToolRoundPlan {
  execute: boolean;
  autoResults: IAiToolResult[];
}

// Decides what to do with the tool calls of one assistant turn. When the
// reply was truncated (stop_reason max_tokens), the tool inputs are not
// trustworthy: answer each with an error result instead of executing.
export const planToolRound = (
  attributes: IAiTurnData['attributes']
): ToolRoundPlan => {
  const truncated =
    attributes.stop_reason === 'max_tokens' &&
    attributes.tool_calls.length > 0;

  if (truncated) {
    return {
      execute: false,
      autoResults: attributes.tool_calls.map((call) => ({
        tool_use_id: call.id,
        content: TRUNCATION_NOTICE,
        is_error: true,
      })),
    };
  }

  return { execute: true, autoResults: [] };
};
