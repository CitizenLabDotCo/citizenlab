# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreatePollQuestion do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:phase) { create(:poll_phase, project: project) }
  let(:params) do
    {
      phase_id: phase.id,
      title_multiloc: { 'en' => 'Q1' }
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the question' do
      response = nil
      expect do
        response = run_mcp_tool(described_class, params:, current_user:)
      end.to change { phase.reload.poll_questions.count }.by(1)

      expect(response).not_to be_error
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the question' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_unauthorized_project
      expect(phase.reload.poll_questions.count).to eq(0)
    end
  end
end
