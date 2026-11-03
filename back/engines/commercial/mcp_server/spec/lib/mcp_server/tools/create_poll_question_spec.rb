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

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the question' do
      response = nil
      expect { response = run(params) }.to change { phase.reload.poll_questions.count }.by(1)

      expect(response).not_to be_error
      expect(response.structured_content).to include(
        id: phase.poll_questions.sole.id,
        title_multiloc: { 'en' => 'Q1' }
      )
    end

    it 'creates the question with its options in one transaction' do
      options = [{ title_multiloc: { 'en' => 'Yes' } }, { title_multiloc: { 'en' => 'No' } }]

      response = run(params.merge(options:))

      expect(response).not_to be_error

      titles = options.pluck(:title_multiloc)
      question = phase.poll_questions.sole
      expect(question.options.order(:ordering).pluck(:title_multiloc)).to eq(titles)
      expect(response.structured_content[:options].pluck(:title_multiloc)).to eq(titles)
    end

    it 'rolls back the question when an option is invalid' do
      options = [{ title_multiloc: { 'en' => 'Yes' } }, { title_multiloc: {} }]

      response = nil
      expect { response = run(params.merge(options:)) }
        .not_to change { phase.reload.poll_questions.count }

      expect(response).to be_error
      expect(response.structured_content[:errors]).to include(
        a_hash_including(attribute: 'title_multiloc', error: :blank, message: be_present)
      )
    end

    it 'returns a not-found error when the phase is missing' do
      response = run(params.merge(phase_id: SecureRandom.uuid))
      expect(response).to be_not_found('Phase')
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the question' do
      response = run(params)

      expect(response).to be_unauthorized_project
      expect(phase.reload.poll_questions.count).to eq(0)
    end
  end
end
