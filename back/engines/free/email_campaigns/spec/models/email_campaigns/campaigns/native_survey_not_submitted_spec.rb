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
    let(:notification) { create(:native_survey_not_submitted, idea: input, project: input.project, phase: input.creation_phase) }
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

  describe 'send_on_activity' do
    before { create(:idea_status_proposed) }

    let!(:global_campaign) { create(:native_survey_not_submitted_campaign) }
    let!(:context_campaign) { create(:native_survey_not_submitted_campaign, context: create(:phase)) }
    let(:service) { EmailCampaigns::DeliveryService.new }
    let(:phase) { create(:ideation_phase) }
    let(:notification) { create(:native_survey_not_submitted, idea: create(:native_survey_response), phase: phase) }
    let(:activity) { create(:activity, item_id: notification.id, item_type: notification.class.name, action: 'created') }

    it 'receives process_command when falling back to the global campaign' do
      expect(service).to receive(:process_command).with(global_campaign, anything).once
      expect(service).not_to receive(:process_command).with(context_campaign, anything)
      service.send_on_activity(activity)
    end

    context 'for a context campaign' do
      let!(:context_campaign) { create(:native_survey_not_submitted_campaign, context: phase) }

      context 'on an ideation phase' do
        it 'receives process_command for the context campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'on a proposals phase' do
        let(:phase) { create(:proposals_phase) }

        it 'receives process_command for the context campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'on a voting phase' do
        let(:phase) { create(:single_voting_phase) }

        it 'receives process_command for the context campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'on an information phase' do
        let(:phase) { create(:information_phase) }

        it 'does not receive process_command for the context campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'on an native survey phase' do
        let(:phase) { create(:native_survey_phase) }

        it 'does not receive process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end
    end
  end
end
