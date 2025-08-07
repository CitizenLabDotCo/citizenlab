# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentDeletedByAdmin do
  describe 'CommentDeletedByAdmin Campaign default factory' do
    it 'is valid' do
      expect(build(:comment_deleted_by_admin_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:comment_deleted_by_admin_campaign) }
    let(:notification) { create(:comment_deleted_by_admin) }
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
        command.dig(:event_payload, :comment_created_at)
      ).to eq(notification.comment.created_at.iso8601)
    end
  end

  describe 'send_on_activity' do
    let!(:global_campaign) { create(:comment_deleted_by_admin_campaign) }
    let!(:context_campaign) { create(:comment_deleted_by_admin_campaign, context: create(:phase)) }
    let(:service) { EmailCampaigns::DeliveryService.new }
    let(:phase) { create(:ideation_phase, :ongoing) }
    let(:idea) { create(:idea, phases: [phase]) }
    let(:notification) { create(:comment_deleted_by_admin, idea: idea) }
    let(:activity) { create(:activity, item_id: notification.id, item_type: notification.class.name, action: 'created') }

    it 'receives process_command when falling back to the global campaign' do
      expect(service).to receive(:process_command).with(global_campaign, anything).once
      expect(service).not_to receive(:process_command).with(context_campaign, anything)
      service.send_on_activity(activity)
    end

    context 'for a context campaign' do
      let!(:context_campaign) { create(:comment_deleted_by_admin_campaign, context: phase) }

      context 'on an ideation phase' do
        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on a proposals phase' do
        let(:phase) { create(:proposals_phase, :ongoing) }

        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on a voting phase' do
        let(:phase) { create(:single_voting_phase, :ongoing) }

        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on an information phase' do
        let(:phase) { create(:information_phase, :ongoing) }

        it 'receives process_command for the global campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'on an native survey phase' do
        let(:phase) { create(:native_survey_phase, :ongoing) }

        it 'receives process_command for the global campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end

      context 'for a past phase' do
        let(:phase) { create(:ideation_phase, start_at: Time.zone.today - 7.days, end_at: Time.zone.today - 1.day) }

        it 'receives process_command for the global campaign' do
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end
    end
  end
end
