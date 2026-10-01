# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::ToolCall do
  describe '#expired?' do
    it 'is true for proposals older than the approval TTL' do
      expect(build(:ai_assistant_tool_call, created_at: 25.hours.ago)).to be_expired
      expect(build(:ai_assistant_tool_call, created_at: 1.hour.ago)).not_to be_expired
      expect(build(:ai_assistant_tool_call, status: 'executed', created_at: 25.hours.ago)).not_to be_expired
    end
  end

  describe '#result_for_llm' do
    it 'reports calls without a result as interrupted' do
      expect(build(:ai_assistant_tool_call, status: 'pending', result: nil).result_for_llm).to include('interrupted')
      expect(build(:ai_assistant_tool_call, status: 'executed', result: 'Done').result_for_llm).to eq('Done')
    end
  end
end
