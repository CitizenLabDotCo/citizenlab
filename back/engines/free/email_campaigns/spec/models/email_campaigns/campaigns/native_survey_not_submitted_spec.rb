# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NativeSurveyNotSubmitted do
  describe 'NativeSurveyNotSubmitted Campaign default factory' do
    it 'is valid' do
      expect(build(:native_survey_not_submitted_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    before { create(:idea_status_proposed) }

    let!(:input) { create(:native_survey_response, author: create(:user)) }
    let(:notification) { create(:native_survey_not_submitted, post: input, project: input.project, phase: input.creation_phase) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      campaign = create(:native_survey_not_submitted_campaign)
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command.dig(:event_payload, :survey_url))
        .to end_with "/ideas/new?phase_id=#{input.creation_phase.id}"
      expect(command.dig(:event_payload, :phase_title_multiloc))
        .to eq input.creation_phase.title_multiloc
      expect(command.dig(:event_payload, :phase_end_at))
        .to eq input.creation_phase.end_at
    end
  end
end
