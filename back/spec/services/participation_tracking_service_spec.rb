# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationTrackingService do
  describe '.track?' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:phase) { project.phases.first }

    it 'is true for an idea' do
      expect(described_class.track?(create(:idea, project: project))).to be true
    end

    it 'is true for an idea without an author that is not anonymous' do
      expect(described_class.track?(create(:idea, project: project, author: nil))).to be true
    end

    it 'is false for an anonymous idea' do
      expect(described_class.track?(create(:idea, project: project, anonymous: true))).to be false
    end

    it 'is true for a named idea or comment in a phase that allows anonymous participation' do
      phase.update!(allow_anonymous_participation: true)
      idea = create(:idea, project: project)

      expect(described_class.track?(idea)).to be true
      expect(described_class.track?(create(:comment, idea: idea))).to be true
    end

    it 'is false when the project has no current phase' do
      idea = create(:idea, project: project)
      phase.update!(start_at: 1.year.from_now, end_at: nil)

      expect(described_class.track?(create(:comment, idea: idea))).to be false
    end

    it 'is false for a survey response, even a draft, in a survey that does not collect all user data' do
      survey_project = create(:single_phase_native_survey_project)
      survey_phase = survey_project.phases.first
      survey_phase.permissions.find_by(action: 'posting_idea').update!(user_data_collection: 'demographics_only')
      create(:idea_status_proposed)
      draft = create(:native_survey_response, project: survey_project, creation_phase: survey_phase, publication_status: 'draft')

      expect(described_class.track?(draft)).to be false
    end

    it 'is true for a basket' do
      voting_project = create(:project_with_active_budgeting_phase)

      expect(described_class.track?(create(:basket, phase: voting_project.phases.first))).to be true
    end
  end
end
