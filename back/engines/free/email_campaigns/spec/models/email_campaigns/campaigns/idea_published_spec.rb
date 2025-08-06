# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::IdeaPublished do
  describe 'IdeaPublished Campaign default factory' do
    it 'is valid' do
      expect(build(:idea_published_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:idea_published_campaign) }
    let(:user) { create(:user) }
    let(:idea) { create(:idea, author: user) }
    let(:activity) { create(:activity, item: idea, action: 'published', user: user) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command[:event_payload]).to include(
        idea_id: idea.id,
        input_term: 'idea'
      )
    end

    describe do
      before { create(:idea_status_proposed) }

      let(:idea) do
        project = create(:single_phase_native_survey_project)
        create(:idea, author: user, project: project, creation_phase: project.phases.first)
      end

      it "doesn't get triggered for a native survey response" do
        commands = campaign.generate_commands recipient: user, activity: activity

        expect(commands).to be_empty
      end
    end
  end

  describe 'send_on_activity' do
    let!(:global_campaign) { create(:idea_published_campaign) }
    let!(:context_campaign) { create(:idea_published_campaign, context: create(:phase)) }
    let(:service) { EmailCampaigns::DeliveryService.new }
    let(:phase) { create(:ideation_phase) }
    let(:idea) { create(:idea, phases: [phase]) }
    let(:activity) { create(:activity, item: idea, action: 'published') }

    it 'receives process_command when falling back to the global campaign' do
      expect(service).to receive(:process_command).with(global_campaign, anything).once
      expect(service).not_to receive(:process_command).with(context_campaign, anything)
      service.send_on_activity(activity)
    end

    context 'for a context campaign' do
      let!(:context_campaign) { create(:idea_published_campaign, context: phase) }

      context 'on an ideation phase' do
        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on a proposals phase' do
        let(:phase) { create(:proposals_phase) }

        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
          service.send_on_activity(activity)
        end
      end

      context 'on a voting phase' do
        let(:phase) { create(:single_voting_phase) }

        it 'receives process_command for the context campaign' do
          expect(service).not_to receive(:process_command).with(global_campaign, anything)
          expect(service).to receive(:process_command).with(context_campaign, anything).once
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
          expect(service).to receive(:process_command).with(global_campaign, anything).once
          expect(service).not_to receive(:process_command).with(context_campaign, anything)
          service.send_on_activity(activity)
        end
      end
    end
  end
end
