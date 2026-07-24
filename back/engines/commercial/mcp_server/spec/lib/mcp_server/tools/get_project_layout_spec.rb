# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetProjectLayout do
  let_it_be(:current_user) { create(:super_admin) }

  let(:craftjs_json) do
    {
      'ROOT' => craftjs_root(['T1']),
      'T1' => craftjs_node(
        'TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hello</p>' } }
      )
    }
  end

  context 'when the project has no custom layout' do
    let(:project) { create(:project) }

    it 'returns exists: false with the widget format guide' do
      response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

      expect(response).not_to be_error
      expect(response.structured_content[:exists]).to be(false)
      expect(response.structured_content[:format_guide])
        .to eq(McpServer::LayoutWidgets::CHEATSHEET)
    end
  end

  context 'when the project has a custom layout' do
    let(:project) { create(:project) }
    let!(:layout) { create(:layout, project: project, code: 'project_description', craftjs_json: craftjs_json) }

    it 'returns the layout and an outline in visual order' do
      response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

      expect(response).not_to be_error

      structured = response.structured_content
      expect(structured[:exists]).to be(true)
      expect(structured[:enabled]).to eq(layout.enabled)
      expect(structured[:outline]).to be_an(Array)
      expect(structured[:outline].pluck(:id)).to eq(%w[ROOT T1])
      expect(structured[:craftjs_json]).to eq(layout.craftjs_json)
      expect(structured).not_to have_key(:format_guide)
    end
  end

  context 'when the project does not exist' do
    it 'returns an error' do
      response = run_mcp_tool(described_class, params: { project_id: SecureRandom.uuid }, current_user:)

      expect(response).to be_error
      expect(response.content.first[:text]).to match(/not found/i)
    end
  end
end
