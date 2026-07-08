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

  it 'every registered tool has a well-formed definition' do
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

  it 'requires Runner subclasses to implement #run' do
    runner = described_class::Runner.new(params: {}, server_context: {}, current_user: nil, token_scopes: [])

    expect { runner.run }.to raise_error(NotImplementedError)
  end

  describe '.unauthorized_message' do
    it 'includes the reason of a NotAuthorizedErrorWithReason' do
      error = Pundit::NotAuthorizedErrorWithReason.new(reason: 'the project has inputs')

      expect(described_class.unauthorized_message(error)).to eq('Not allowed: the project has inputs.')
    end

    it 'falls back to a generic message for a plain NotAuthorizedError' do
      error = Pundit::NotAuthorizedError.new('secret internals')

      expect(described_class.unauthorized_message(error)).to eq('Not allowed: authorization failed.')
    end
  end
end
