# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::ToolCall do
  describe '#result_for_llm' do
    it 'reports calls without a result as interrupted' do
      expect(build(:ai_assistant_tool_call, status: 'pending', result: nil).result_for_llm).to include('interrupted')
      expect(build(:ai_assistant_tool_call, status: 'auto_executed', result: 'Done').result_for_llm).to eq('Done')
    end
  end
end
