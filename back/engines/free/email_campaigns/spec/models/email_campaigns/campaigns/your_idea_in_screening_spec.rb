# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::YourInputInScreening do
  describe 'YourInputInScreening Campaign default factory' do
    it 'is valid' do
      expect(build(:your_input_in_screening_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:your_input_in_screening_campaign) }
    let(:user) { create(:user) }
    let(:proposal) { create(:proposal, author: user) }
    let(:activity) { create(:activity, item: proposal, action: 'submitted', user: user) }

    it 'generates a command with the desired payload' do
      command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command[:event_payload]).to include(
        input_id: proposal.id
      )
    end
  end

  describe 'filter' do
    it "doesn't block the campaign if the input is in prescreening status" do
      campaign = create(:your_input_in_screening_campaign)
      user = create(:user)
      idea_status = create(:proposal_status_prescreening)
      proposal = create(:proposal, author: user, publication_status: 'submitted', idea_status:)
      activity = create(:activity, item: proposal, action: 'submitted', user: user)

      expect(campaign.run_filter_hooks(activity: activity)).to be_truthy
    end

    it "doesn't send the campaign if the input is not in prescreening status" do
      campaign = create(:your_input_in_screening_campaign)
      user = create(:user)
      proposal = create(:proposal, author: user)
      activity = create(:activity, item: proposal, action: 'submitted', user: user)

      expect(campaign.run_filter_hooks(activity: activity)).to be_falsy
    end
  end

  describe 'send_on_activity' do
    let(:context) { create(:proposals_phase) }
    let(:phase) { context }
    let!(:global_campaign) { create(:your_input_in_screening_campaign) }
    let!(:context_campaign) { create(:your_input_in_screening_campaign, context:) }
    let(:activity) do
      proposal = create(:proposal, idea_status: create(:proposal_status_prescreening), publication_status: 'submitted', project: phase.project, creation_phase: phase, phases: [phase])
      create(:activity, item: proposal, action: 'submitted')
    end

    describe do
      let(:context) { create(:proposals_phase) }

      it 'delivers global campaigns' do
        expect do
          EmailCampaigns::DeliveryService.new.send_on_activity(activity)
        end.to have_enqueued_job(ActionMailer::MailDeliveryJob).exactly(:once)
          .and have_enqueued_job(ActionMailer::MailDeliveryJob)
          .with(
            global_campaign.mailer_class.to_s,
            'campaign_mail',
            'deliver_now',
            anything
          )
      end
    end

    it 'delivers context campaigns' do
      expect do
        EmailCampaigns::DeliveryService.new.send_on_activity(activity)
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob).exactly(:once)
        .and have_enqueued_job(ActionMailer::MailDeliveryJob)
        .with(
          context_campaign.mailer_class.to_s,
          'campaign_mail',
          'deliver_now',
          anything
        )
    end
  end
end
