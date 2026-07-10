# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool do
  it 'requires Runner subclasses to implement #run' do
    runner = described_class::Runner.new(
      params: {},
      server_context: {},
      current_user: nil,
      token_scopes: []
    )

    expect { runner.run }.to raise_error(NotImplementedError)
  end

  describe '.unauthorized_message' do
    it 'includes the reason of a NotAuthorizedErrorWithReason' do
      error = Pundit::NotAuthorizedErrorWithReason.new(reason: 'The project has inputs.')

      expect(described_class.unauthorized_message(error)).to eq('Not allowed: The project has inputs.')
    end

    it 'falls back to a generic message for a plain NotAuthorizedError' do
      error = Pundit::NotAuthorizedError.new('secret internals')

      expect(described_class.unauthorized_message(error)).to eq('Not allowed: authorization failed.')
    end
  end
end
