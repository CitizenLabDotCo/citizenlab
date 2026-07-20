# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetProjectLayout do
  let_it_be(:current_user) { create(:super_admin) }

  let(:project) { create(:project) }
  let(:craftjs_json) do
    project_page_craftjs(
      'T1' => craftjs_node(
        'TextMultiloc',
        parent: 'PROJECT_PAGE_DESCRIPTION',
        props: { 'text' => { 'en' => '<p>Hello</p>' } }
      )
    )
  end

  context 'when the project has a page layout' do
    let!(:layout) { create(:layout, project: project, code: 'project_page', craftjs_json: craftjs_json) }

    it 'returns the layout and an outline in visual order' do
      response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

      expect(response).not_to be_error

      structured = response.structured_content
      expect(structured[:enabled]).to eq(layout.enabled)
      expect(structured[:outline].pluck(:id)).to eq(%w[
        ROOT PROJECT_PAGE_BANNER PROJECT_PAGE_TITLE PROJECT_PAGE_BODY
        PROJECT_PAGE_DESCRIPTION T1 PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS
      ])
      expect(structured[:craftjs_json]).to eq(layout.craftjs_json)
    end

    it 'marks the scaffold nodes as locked in the outline, but not the content' do
      response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

      locked = response.structured_content[:outline].to_h { |entry| [entry[:id], entry[:locked]] }
      expect(locked['PROJECT_PAGE_BANNER']).to be(true)
      expect(locked['PROJECT_PAGE_DESCRIPTION']).to be(true)
      expect(locked['T1']).to be_nil
    end
  end

  context 'when the project has no page layout (provisioning anomaly)' do
    it 'returns an error instead of synthesizing one' do
      response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

      expect(response).to be_error
      expect(response.content.first[:text]).to include('has no page layout')
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
