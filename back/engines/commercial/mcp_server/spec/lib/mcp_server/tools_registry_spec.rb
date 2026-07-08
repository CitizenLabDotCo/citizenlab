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

  it 'every tool has a well-formed definition' do
    aggregate_failures do
      McpServer::McpController::TOOL_CLASSES.each do |tool_class|
        tool = tool_class.new

        expect(tool.name).to match(/\A[a-z_]+\z/), "#{tool_class.name} name: #{tool.name.inspect}"
        expect(tool.description).to be_present, "#{tool_class.name} has no description"

        schema = tool.input_schema
        expect(schema[:properties]).to be_a(Hash), "#{tool_class.name} has no properties"

        unknown_required = Array(schema[:required]).map(&:to_sym) - schema[:properties].keys.map(&:to_sym)
        expect(unknown_required).to be_empty,
          "#{tool_class.name} requires fields missing from properties: #{unknown_required.inspect}"
      end
    end
  end
end
