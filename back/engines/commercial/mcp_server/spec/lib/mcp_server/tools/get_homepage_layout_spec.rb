# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetHomepageLayout do
  let_it_be(:current_user) { create(:super_admin) }

  # Spec tenants may already carry a seeded homepage layout; start from a known one.
  before { ContentBuilder::Layout.where(code: 'homepage').delete_all }

  context 'with a homepage layout' do
    let(:craftjs_json) do
      homepage_craftjs(
        'H1' => craftjs_node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hello</p>' } })
      )
    end
    let!(:layout) { create(:homepage_layout, craftjs_json: craftjs_json) }

    it 'returns the layout and an outline, marking the fixed widgets locked' do
      response = run_mcp_tool(described_class, params: {}, current_user:)

      expect(response).not_to be_error
      structured = response.structured_content
      expect(structured[:enabled]).to eq(layout.enabled)
      expect(structured[:outline].pluck(:id)).to eq(%w[ROOT HOMEPAGEBANNER PROJECTS H1])
      expect(structured[:craftjs_json]).to eq(layout.craftjs_json)

      locked = structured[:outline].to_h { |entry| [entry[:id], entry[:locked]] }
      expect(locked['HOMEPAGEBANNER']).to be(true)
      expect(locked['PROJECTS']).to be(true)
      expect(locked['H1']).to be_nil
    end
  end

  context 'without a homepage layout' do
    it 'returns an error' do
      response = run_mcp_tool(described_class, params: {}, current_user:)

      expect(response).to be_error
      expect(response.content.first[:text]).to include('no homepage layout')
    end
  end
end
