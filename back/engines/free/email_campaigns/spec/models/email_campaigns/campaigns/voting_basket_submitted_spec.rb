# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::VotingBasketSubmitted do
  describe 'VotingBasketSubmitted Campaign default factory' do
    it 'is valid' do
      expect(build(:voting_basket_submitted_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:project) { create(:continuous_budgeting_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:basket) { create(:basket, participation_context: project) }
    let!(:baskets_idea) { create(:baskets_idea, basket: basket, idea: idea) }
    let(:notification) { create(:voting_basket_submitted, basket: basket, project: project) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      campaign = create(:voting_basket_submitted_campaign)
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command.dig(:event_payload, :project_url))
        .to eq Frontend::UrlService.new.model_to_url(project, locale: notification_activity.item.recipient.locale)
      expect(command.dig(:event_payload, :voted_ideas, 0, :title_multiloc))
        .to eq idea.title_multiloc
    end
  end
end
