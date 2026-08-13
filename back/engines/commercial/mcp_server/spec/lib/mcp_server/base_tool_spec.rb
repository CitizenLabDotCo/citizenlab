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

  # Wiring only — the walk itself is unit-tested in readonly_strip_spec.
  describe 'readOnly params stripping' do
    let(:tool_class) do
      Class.new(described_class) do
        def name = 'probe'
        def description = 'Probe tool'

        def input_schema
          {
            properties: {
              name: { type: 'string' },
              created_at: { type: 'string', readOnly: true }
            }
          }
        end

        # rubocop:disable RSpec/LeakyConstantDeclaration
        self::Runner = Class.new(McpServer::BaseTool::Runner) do
          def run = response('params', structured: params)
        end
        # rubocop:enable RSpec/LeakyConstantDeclaration
      end
    end

    it 'strips readOnly properties from the params' do
      response = run_mcp_tool(
        tool_class,
        params: { name: 'x', created_at: '2026-01-01' },
        current_user: nil
      )

      expect(response.structured_content).to eq(name: 'x')
    end
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

  describe 'locale guard' do
    let(:current_user) { create(:super_admin) }

    before do
      config = AppConfiguration.instance
      config.settings['core']['locales'] = %w[en fr-BE]
      config.save!
    end

    it 'rejects a multiloc argument with an inactive locale, naming the active locales' do
      response = nil
      expect do
        response = run_mcp_tool(
          McpServer::Tools::CreateProject,
          params: { title_multiloc: { 'de-DE' => 'Titel', 'en' => 'Title' } },
          current_user:
        )
      end.not_to change(Project, :count)

      expect(response).to be_error
      text = response.content.first[:text]
      expect(text).to include('de-DE')
      expect(text).to include('en, fr-BE')
    end

    it 'rejects inactive locales nested inside other arguments, before the runner executes' do
      # The bogus id proves the guard fires before the runner: a running tool would
      # answer "not found" instead of the locale error.
      response = run_mcp_tool(
        McpServer::Tools::UpdateResource,
        params: { type: 'cause', id: SecureRandom.uuid, attributes: { title_multiloc: { 'nl-NL' => 'Titel' } } },
        current_user:
      )

      expect(response).to be_error
      expect(response.content.first[:text]).to include('nl-NL')
    end

    it 'accepts multilocs written in active locales' do
      response = run_mcp_tool(
        McpServer::Tools::CreateProject,
        params: { title_multiloc: { 'en' => 'Title', 'fr-BE' => 'Titre' } },
        current_user:
      )

      expect(response).not_to be_error
    end
  end
end
