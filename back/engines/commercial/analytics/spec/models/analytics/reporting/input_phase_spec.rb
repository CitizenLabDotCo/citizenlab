# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputPhase do
  let(:project) { create(:project) }
  let(:ideation_phase) { create(:phase, project: project, start_at: 20.days.ago, end_at: 10.days.ago) }
  let(:voting_phase) { create(:single_voting_phase, project: project, start_at: 9.days.ago, end_at: nil) }

  it 'links an input to every phase it belongs to' do
    idea = create(:idea, project: project, phases: [ideation_phase, voting_phase])

    expect(described_class.where(input_id: idea.id).pluck(:phase_id))
      .to contain_exactly(ideation_phase.id, voting_phase.id)
  end

  it 'links a survey response to the phase it was given in' do
    create(:idea_status_proposed)
    response = create(:native_survey_response)

    expect(described_class.where(input_id: response.id).pluck(:phase_id))
      .to eq [response.creation_phase_id]
  end

  it 'excludes draft inputs' do
    draft = create(:idea, project: project, phases: [ideation_phase], publication_status: 'draft')

    expect(described_class.where(input_id: draft.id)).to be_empty
  end
end
