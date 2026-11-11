# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationTrackingService do
  describe '.track?' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:phase) { project.phases.first }

    it 'is true for a newly published idea' do
      expect(described_class.track?(create(:idea, project: project))).to be true
    end

    it 'is true for an idea without an author that is not anonymous' do
      expect(described_class.track?(create(:idea, project: project, author: nil))).to be true
    end

    it 'is false for an idea saved again after it was published' do
      idea = create(:idea, project: project)
      idea.update!(title_multiloc: { 'en' => 'Changed' })

      expect(described_class.track?(idea)).to be false
    end

    it 'is false for a draft, and true when the draft is published' do
      idea = create(:idea, project: project, publication_status: 'draft')
      expect(described_class.track?(idea)).to be false

      idea.update!(publication_status: 'published')
      expect(described_class.track?(idea)).to be true
    end

    it 'is false for an anonymous idea' do
      expect(described_class.track?(create(:idea, project: project, anonymous: true))).to be false
    end

    it 'is false for a named idea in a phase that allows anonymous participation' do
      phase.update!(allow_anonymous_participation: true)

      expect(described_class.track?(create(:idea, project: project))).to be false
    end

    it 'is false for a comment in a phase that allows anonymous participation' do
      idea = create(:idea, project: project)
      phase.update!(allow_anonymous_participation: true)

      expect(described_class.track?(create(:comment, idea: idea))).to be false
    end

    it 'is false when the project has no current phase' do
      idea = create(:idea, project: project)
      phase.update!(start_at: 1.year.from_now, end_at: nil)

      expect(described_class.track?(create(:comment, idea: idea))).to be false
    end

    it 'is false for a survey response in a survey that does not collect all user data' do
      survey_project = create(:single_phase_native_survey_project)
      survey_phase = survey_project.phases.first
      survey_phase.permissions.find_by(action: 'posting_idea').update!(user_data_collection: 'demographics_only')
      create(:idea_status_proposed)
      response = create(:native_survey_response, project: survey_project, creation_phase: survey_phase)

      expect(described_class.track?(response)).to be false
    end

    it 'is false for a basket until it is submitted' do
      voting_project = create(:project_with_active_budgeting_phase)
      basket = create(:basket, phase: voting_project.phases.first, submitted_at: nil)
      expect(described_class.track?(basket)).to be false

      basket.update!(submitted_at: Time.zone.now)
      expect(described_class.track?(basket)).to be true
    end
  end
end
