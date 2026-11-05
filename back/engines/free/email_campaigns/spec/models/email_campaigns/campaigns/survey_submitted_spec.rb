# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::SurveySubmitted do
  describe 'SurveySubmitted Campaign default factory' do
    it 'is valid' do
      expect(build(:survey_submitted_campaign)).to be_valid
    end
  end

  describe '#activity_context' do
    before { create(:idea_status_proposed) }

    it 'returns the creation phase of the input, not the current timeline phase' do
      project = create(:project_with_current_phase)
      standalone = create(:phase, :standalone, project: project,
        start_at: 1.week.ago, end_at: 1.week.from_now)
      response = create(:native_survey_response, project: project, creation_phase: standalone)
      activity = create(:activity, item: response, action: 'published')

      campaign = create(:survey_submitted_campaign)
      expect(campaign.activity_context(activity)).to eq standalone
    end
  end

  describe '#generate_commands' do
    before { create(:idea_status_proposed) }

    let(:campaign) { create(:survey_submitted_campaign) }
    let(:user) { create(:user) }
    let(:project) { create(:single_phase_native_survey_project) }
    let(:idea) { create(:idea, author: user, project: project, creation_phase: project.phases.first) }
    let(:activity) { create(:activity, item: idea, action: 'published', user: user) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command[:event_payload]).to include(
        idea_id: idea.id,
        project_title_multiloc: project.title_multiloc,
        profile_url: "http://example.org/profile/#{user.id}/surveys"
      )
    end

    describe 'no commands generated' do
      let(:idea) { create(:idea, author: user) }
      let(:activity) { create(:activity, item: idea, action: 'published', user: user) }

      it "doesn't get triggered for a regular idea" do
        commands = campaign.generate_commands recipient: user, activity: activity

        expect(commands).to be_empty
      end
    end
  end
end
