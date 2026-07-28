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
