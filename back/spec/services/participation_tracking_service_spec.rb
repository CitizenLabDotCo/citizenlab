# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationTrackingService do
  describe '.track?' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:phase) { project.phases.first }
    let(:user) { create(:user) }

    before { Current.request_user_id = user.id }

    it 'is true for an idea posted by the signed-in participant' do
      expect(described_class.track?(create(:idea, project: project, author: user))).to be true
    end

    it 'is true for an idea posted without signing in that is not anonymous' do
      Current.request_user_id = nil

      expect(described_class.track?(create(:idea, project: project, author: nil))).to be true
    end

    it 'is false for an idea a moderator posts on behalf of someone else' do
      expect(described_class.track?(create(:idea, project: project, author: create(:user)))).to be false
    end

    it 'is false for an idea created through the MCP server' do
      Current.activity_channel = 'mcp'

      expect(described_class.track?(create(:idea, project: project, author: user))).to be false
    end

    it 'is false for an anonymous idea' do
      expect(described_class.track?(create(:idea, project: project, anonymous: true))).to be false
    end

    it 'is true for a named idea or comment in a phase that allows anonymous participation' do
      phase.update!(allow_anonymous_participation: true)
      idea = create(:idea, project: project, author: user)

      expect(described_class.track?(idea)).to be true
      expect(described_class.track?(create(:comment, idea: idea, author: user))).to be true
    end

    it 'is true for a comment, whatever the current phase' do
      survey_phase = create(:native_survey_phase, project: project, start_at: 1.week.from_now, end_at: nil)
      survey_phase.permissions.find_by(action: 'posting_idea')&.update!(user_data_collection: 'demographics_only')
      idea = create(:idea, project: project, author: user)

      expect(described_class.track?(create(:comment, idea: idea, author: user))).to be true
    end

    it 'is false for a survey response, even a draft, in a survey that does not collect all user data' do
      survey_project = create(:single_phase_native_survey_project)
      survey_phase = survey_project.phases.first
      survey_phase.permissions.find_by(action: 'posting_idea').update!(user_data_collection: 'demographics_only')
      create(:idea_status_proposed)
      draft = create(
        :native_survey_response,
        project: survey_project, creation_phase: survey_phase, publication_status: 'draft', author: user
      )

      expect(described_class.track?(draft)).to be false
    end

    it 'is true for a basket submitted by the participant' do
      voting_project = create(:project_with_active_budgeting_phase)

      expect(described_class.track?(create(:basket, phase: voting_project.phases.first, user: user))).to be true
    end
  end

  describe '.export_includes' do
    let(:project) { create(:project, track_participation_location: true) }

    it 'includes the location when the project tracks it' do
      SettingsService.new.activate_feature!('participation_location_tracking')

      expect(described_class.export_includes(project)).to eq [:participation_location]
    end

    it 'is empty when location tracking is off' do
      SettingsService.new.deactivate_feature!('participation_location_tracking')

      expect(described_class.export_includes(project)).to eq []
    end
  end
end
