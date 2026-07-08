# frozen_string_literal: true

require 'rails_helper'

# Lint rules over the registered tools: conventions every tool must follow,
# enforced here because clients consume the registry sight unseen.
describe 'MCP tools registry' do
  it 'every tool spells out all four annotation hint fields' do
    aggregate_failures do
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

  # Not checked by the MCP gem: a typo here yields a tool that lists fine but
  # rejects every call with "Missing required arguments".
  it 'every tool declares only defined properties as required' do
    aggregate_failures do
      McpServer::McpController::TOOL_CLASSES.each do |tool_class|
        schema = tool_class.new.input_schema
        unknown_required = Array(schema[:required]).map(&:to_sym) - schema.fetch(:properties).keys

        expect(unknown_required).to be_empty,
          "#{tool_class.name} requires fields missing from properties: #{unknown_required.inspect}"
      end
    end
  end
end
