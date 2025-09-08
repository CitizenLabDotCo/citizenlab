# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectPhaseStarted do
  let(:campaign) { create(:project_phase_started_campaign) }

  describe 'ProjectPhaseStarted Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe '#generate_commands' do
    context 'phase is not a voting phase' do
      let(:project) { create(:project_with_current_phase) }
      let(:notification) { create(:project_phase_started, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'generates a command with the desired payload and tracked content' do
        campaign = create(:project_phase_started_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command.dig(:event_payload, :phase_title_multiloc))
          .to eq project.phases.last.title_multiloc
      end
    end

    context 'phase is a voting phase' do
      let(:project) { create(:project_with_active_budgeting_phase) }
      let(:notification) { create(:project_phase_started, project: project, phase: project.phases.last) }
      let(:notification_activity) { create(:activity, item: notification, action: 'created') }

      it 'does not generate any payload' do
        campaign = create(:project_phase_started_campaign)
        command = campaign.generate_commands(
          recipient: notification_activity.item.recipient,
          activity: notification_activity
        ).first

        expect(command).to be_nil
      end
    end
  end

  describe 'send_on_activity' do
    let!(:global_campaign) { create(:project_phase_started_campaign) }
    let!(:context_campaign) { create(:project_phase_started_campaign, context: create(:phase)) }
    let(:service) { EmailCampaigns::DeliveryService.new }
    let(:phase) { create(:ideation_phase) }
    let(:notification) { create(:project_phase_started, phase: phase) }
    let(:activity) { create(:activity, item_id: notification.id, item_type: notification.class.name, action: 'created') }

    context 'for a context campaign' do
      let!(:context_campaign) { create(:project_phase_started_campaign, context: phase) }

      context 'on an ideation phase' do
        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on an information phase' do
        let(:phase) { create(:information_phase) }

        it 'does not receive process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
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
