# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListPollQuestions do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project) }
  let(:phase) { create(:poll_phase, project:) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists poll questions of the phase in display order' do
    question_a = create(:poll_question, phase:)
    question_b = create(:poll_question, phase:)
    create(:poll_question) # question in another phase
    question_b.move_to_top

    response = list(phase_id: phase.id)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([question_b.id, question_a.id])
  end

  it 'serializes question fields with the options inlined' do
    question = create(:poll_question, phase:, title_multiloc: { 'en' => 'Favourite colour?' })
    option = create(:poll_option, question:, title_multiloc: { 'en' => 'Blue' })

    response = list(phase_id: phase.id)

    expect(response.structured_content[:data].sole).to include(
      id: question.id,
      title_multiloc: { 'en' => 'Favourite colour?' },
      question_type: 'single_option',
      options: [a_hash_including(id: option.id, title_multiloc: { 'en' => 'Blue' })]
    )
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { phase_id: phase.id } }
  end

  it 'returns a not-found error when the phase is missing' do
    response = list(phase_id: SecureRandom.uuid)

    expect(response).to be_not_found('Phase')
  end

  it 'returns an error when the phase is not a poll phase' do
    ideation_phase = create(:phase, project:)

    response = list(phase_id: ideation_phase.id)

    expect(response).to be_error
    expect(response.content.first[:text]).to include("only 'poll' phases have poll questions")
  end
end
