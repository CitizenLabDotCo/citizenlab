# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListPollQuestions do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project) }
  let(:phase) { create(:poll_phase, project:) }

  it 'lists poll questions of the phase in display order' do
    question_a = create(:poll_question, phase:)
    question_b = create(:poll_question, phase:)
    create(:poll_question) # question in another phase
    question_b.move_to_top

    response = run_mcp_tool(described_class, params: { phase_id: phase.id }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([question_b.id, question_a.id])
  end

  it 'serializes question fields with the options inlined' do
    question = create(:poll_question, :with_options, phase:)

    response = run_mcp_tool(described_class, params: { phase_id: phase.id }, current_user:)

    data = response.structured_content[:data]
    expect(data.first).to include(:title_multiloc, :question_type, :options)
    expect(data.first[:options].pluck(:id)).to match_array(question.options.pluck(:id))
    expect(data.first[:options].first).to include(:title_multiloc)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { phase_id: phase.id } }
    let(:create_record) { -> { create(:poll_question, phase:) } }
  end

  it 'returns a not-found error when the phase is missing' do
    response = run_mcp_tool(described_class, params: { phase_id: SecureRandom.uuid }, current_user:)

    expect(response).to be_not_found('Phase')
  end

  it 'returns an error when the phase is not a poll phase' do
    ideation_phase = create(:phase, project:)

    response = run_mcp_tool(described_class, params: { phase_id: ideation_phase.id }, current_user:)

    expect(response).to be_error
    expect(response.content.first[:text]).to include("only 'poll' phases have poll questions")
  end
end
