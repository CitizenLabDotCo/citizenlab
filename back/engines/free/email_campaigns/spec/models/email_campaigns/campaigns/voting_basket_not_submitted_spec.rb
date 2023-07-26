# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::VotingBasketNotSubmitted do
  describe 'VotingNotBasketSubmitted Campaign default factory' do
    it 'is valid' do
      expect(build(:voting_basket_not_submitted_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:project) { create(:continuous_budgeting_project) }
    let!(:basket) { create(:basket, participation_context: project, submitted_at: nil) }
    let(:notification) { create(:voting_basket_not_submitted, basket: basket, project: project) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      campaign = create(:voting_basket_not_submitted_campaign)
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command.dig(:event_payload, :project_url))
        .to eq Frontend::UrlService.new.model_to_url(project, locale: notification_activity.item.recipient.locale)
      expect(command.dig(:event_payload, :context_title_multiloc))
        .to eq project.title_multiloc
    end
  end
end
