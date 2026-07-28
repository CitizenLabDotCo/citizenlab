# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreatePollOption do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:phase) { create(:poll_phase, project: project) }
  let(:question) { create(:poll_question, phase: phase) }
  let(:params) do
    {
      question_id: question.id,
      title_multiloc: { 'en' => 'O1' }
    }
  end

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the option' do
      response = nil
      expect { response = run(params) }.to change { question.reload.options.count }.by(1)

      expect(response).not_to be_error
      expect(response.structured_content).to include(
        id: question.options.sole.id,
        title_multiloc: { 'en' => 'O1' }
      )
    end

    it 'returns structured validation errors for invalid params' do
      response = nil

      expect { response = run(params.merge(title_multiloc: {})) }
        .not_to change(Polls::Option, :count)

      expect(response).to be_error
      expect(response.structured_content[:errors]).to include(
        a_hash_including(attribute: 'title_multiloc', error: :blank, message: be_present)
      )
    end

    it 'returns a not-found error when the question is missing' do
      response = run(params.merge(question_id: SecureRandom.uuid))
      expect(response).to be_not_found('Poll question')
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the option' do
      response = run(params)

      expect(response).to be_unauthorized_project
      expect(question.reload.options.count).to eq(0)
    end
  end
end
