# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateEvent do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:params) do
    {
      project_id: project.id,
      title_multiloc: { 'en' => 'Event 1' },
      start_at: '2026-07-01T10:00:00Z',
      end_at: '2026-07-01T12:00:00Z'
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the event' do
      response = nil
      expect do
        response = run_mcp_tool(described_class, params:, current_user:)
      end.to change { project.reload.events.count }.by(1)

      expect(response).not_to be_error
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the event' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_unauthorized_project
      expect(project.reload.events.count).to eq(0)
    end
  end
end
