# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool do
  it 'every registered tool spells out all four annotation hint fields' do
    McpServer::McpController::TOOL_CLASSES.each do |tool_class|
      annotations = tool_class.new.annotations

      expect(annotations).to match(
        read_only_hint: be_in([true, false]),
        destructive_hint: be_in([true, false]),
        idempotent_hint: be_in([true, false]),
        open_world_hint: be_in([true, false])
      ), "#{tool_class.name} annotations: #{annotations.inspect}"
    end
  end
end
