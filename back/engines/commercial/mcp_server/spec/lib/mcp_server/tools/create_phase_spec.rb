# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreatePhase do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:params) do
    {
      project_id: project.id,
      title_multiloc: { 'en' => 'P1' },
      start_at: '2026-07-01',
      end_at: '2026-08-01',
      participation_method: 'ideation'
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the phase' do
      response = nil
      expect do
        response = run_mcp_tool(described_class, params:, current_user:)
      end.to change { project.reload.phases.count }.by(1)

      expect(response).not_to be_error
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the phase' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_unauthorized_project
      expect(project.reload.phases.count).to eq(0)
    end
  end
end
