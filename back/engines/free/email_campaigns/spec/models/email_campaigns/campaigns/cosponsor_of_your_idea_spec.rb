# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CosponsorOfYourIdea do
  describe 'CosponsorOfYourIdea Campaign default factory' do
    it 'is valid' do
      expect(build(:cosponsor_of_your_idea_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:cosponsor_of_your_idea_campaign) }
    let(:notification) { create(:cosponsor_of_your_idea) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(
        command.dig(:event_payload, :initiating_user_id)
      ).to be_blank
      expect(
        command.dig(:event_payload, :idea_title_multiloc)
      ).not_to be_blank
    end
  end

  describe 'send_on_activity' do
    before { create(:idea_status_proposed) }

    let!(:global_campaign) { create(:cosponsor_of_your_idea_campaign) }
    let!(:context_campaign) { create(:cosponsor_of_your_idea_campaign, context: create(:phase)) }
    let(:service) { EmailCampaigns::DeliveryService.new }
    let(:input) { create(:idea) }
    let(:notification) { create(:cosponsor_of_your_idea, idea: input) }
    let(:activity) { create(:activity, item_id: notification.id, item_type: notification.class.name, action: 'created') }

    it 'receives process_command when falling back to the global campaign' do
      expect(service).to receive(:process_command).with(global_campaign, anything).once
      expect(service).not_to receive(:process_command).with(context_campaign, anything)
      service.send_on_activity(activity)
    end

    context 'for a context campaign' do
      let!(:context_campaign) { create(:cosponsor_of_your_idea_campaign, context: input.creation_phase) }

      context 'on an ideation phase' do
        let!(:context_campaign) { create(:cosponsor_of_your_idea_campaign, context: input.phases.last) }

        it 'receives process_command for the context campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'on a proposals phase' do
        let(:input) { create(:proposal) }

        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on an native survey phase' do
        let(:input) { create(:native_survey_response) }

        it 'does not receive process_command for the context campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end
    end
  end
end
