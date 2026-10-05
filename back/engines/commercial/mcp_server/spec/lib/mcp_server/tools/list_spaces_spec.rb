# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListSpaces do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  def enable_spaces!
    config = AppConfiguration.instance
    config.settings['spaces'] = { 'allowed' => true, 'enabled' => true }
    config.save!
  end

  context 'when the spaces feature is enabled' do
    before { enable_spaces! }

    it 'lists spaces without exposing moderators' do
      space = create(:space)

      response = list

      expect(response).not_to be_error
      entry = response.structured_content[:data].find { |d| d[:id] == space.id }
      expect(entry).to include(title_multiloc: space.title_multiloc)
      expect(entry).not_to have_key(:moderators)
    end
  end

  context 'when the spaces feature is disabled' do
    it 'returns an empty list' do
      create(:space)

      response = list

      expect(response).not_to be_error
      expect(response.structured_content[:data]).to eq([])
    end
  end

  it_behaves_like 'a paginated list tool'
end
