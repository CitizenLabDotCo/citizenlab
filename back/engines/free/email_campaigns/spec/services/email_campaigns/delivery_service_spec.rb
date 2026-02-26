# frozen_string_literal: true

require 'rails_helper'

class NonConsentableCampaignForTest < EmailCampaigns::Campaign; end

class ConsentableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::Consentable

  def self.consentable_roles
    []
  end
end

class ConsentableDisableableCampaignAForTest < EmailCampaigns::Campaign
  include EmailCampaigns::Consentable
  include EmailCampaigns::Disableable

  def self.consentable_roles
    []
  end
end

class ConsentableDisableableCampaignBForTest < EmailCampaigns::Campaign
  include EmailCampaigns::Consentable
  include EmailCampaigns::Disableable

  def self.consentable_roles
    []
  end
end

describe EmailCampaigns::DeliveryService do
  let(:service) { described_class.new }

  describe 'campaign_types' do
    it 'returns all campaign types' do
      expect(service.campaign_types).not_to be_empty
    end

    it 'returns campaign_types that all have at least 1 campaign_type_description translation defined' do
      multiloc_service = MultilocService.new
      service.campaign_types.each do |campaign_type|
        campaign_name = campaign_type.constantize.campaign_name
        expect { multiloc_service.i18n_to_multiloc("email_campaigns.campaign_type_description.#{campaign_name}") }
          .not_to raise_error
      end
    end

    it 'returns campaign_types that are all instantiatable without extra arguments, except for Manual campaigns' do
      (service.campaign_types - service.manual_campaign_types).each do |campaign_type|
        expect { campaign_type.constantize.create! }.not_to raise_error
      end
    end
  end

  describe 'send_on_schedule' do
    let(:campaign) { create(:admin_digest_campaign) }
    let!(:admin) { create(:admin) }

    it 'enqueues an internal delivery job' do
      travel_to campaign.ic_schedule.start_time do
        expect { service.send_on_schedule(Time.now) }
          .to have_enqueued_job(ActionMailer::MailDeliveryJob)
          .exactly(1).times
      end
    end

    it 'creates deliveries for a trackable campaign' do
      travel_to campaign.ic_schedule.start_time do
        service.send_on_schedule(Time.now)
        expect(campaign.deliveries.first).to have_attributes({
          campaign_id: campaign.id,
          user_id: admin.id,
          delivery_status: 'sent'
        })
      end
    end

    it 'doesn\'t raise errors while processing all types of campaigns' do
      service.campaign_classes.each do |klaz|
        factory_type = :"#{klaz.name.demodulize.underscore}_campaign"
        create(factory_type)
      end
      expect { service.send_on_schedule(Time.now) }.not_to raise_error
    end
  end

  describe 'send_on_activity' do
    let!(:campaign) { create(:project_phase_upcoming_campaign) }
    let(:notification) { create(:project_phase_upcoming) }
    let(:activity) do
      Activity.create(
        item: notification,
        item_type: notification.class.name,
        action: 'created',
        acted_at: Time.now
      )
    end
    let(:user) { create(:user) }

    it 'enqueues an internal event job' do
      expect { service.send_on_activity(activity) }
        .to have_enqueued_job(ActionMailer::MailDeliveryJob)
        .exactly(1).times
    end

    it 'doesn\'t raise errors while processing all types of campaigns' do
      activities = [activity, create(:activity, item: create(:area))]
      campaign.destroy!
      service.campaign_classes.each do |klaz|
        factory_type = :"#{klaz.name.demodulize.underscore}_campaign"
        create(factory_type)
      end
      activities.each do |activity|
        expect { service.send_on_activity(activity) }.not_to raise_error
      end
    end

    context 'on project_phase_upcoming notification' do
      let!(:campaign) { create(:project_phase_upcoming_campaign) }
      let(:notification) { create(:project_phase_upcoming) }
      let(:activity) do
        Activity.create(
          item: notification,
          item_type: notification.class.name,
          action: 'created',
          acted_at: Time.now
        )
      end
      let!(:admin) { create(:admin) }

      it 'delays enqueueing a job because the command specifies a delay' do
        freeze_time do
          expect { service.send_on_activity(activity) }
            .to have_enqueued_job(ActionMailer::MailDeliveryJob)
            .exactly(1).times
            .at(Time.now + 8.hours)
        end
      end
    end

    context 'with contextual campaigns' do
      let(:notification) { create(:project_phase_started) }
      let!(:global_campaign) { create(:project_phase_started_campaign, context: nil) }
      let!(:context_campaign) { create(:project_phase_started_campaign, context: notification.phase) }

      it 'receives process_command for the context campaign' do
        expect(service).to receive(:process_command).with(context_campaign, anything).once
        expect(service).not_to receive(:process_command).with(global_campaign, anything)
        service.send_on_activity(activity)
      end

      it 'receives process_command for the global campaign if the context does not match the context campaign' do
        context_campaign.update!(context: create(:phase))
        expect(service).to receive(:process_command).with(global_campaign, anything).once
        expect(service).not_to receive(:process_command).with(context_campaign, anything)
        service.send_on_activity(activity)
      end

      it 'does not receive process_command if the context campaign is disabled' do
        context_campaign.update!(enabled: false)
        expect(service).not_to receive(:process_command)
        service.send_on_activity(activity)
      end

      it 'receives process_command for the global campaign if the context campaign is disabled but the context does not match the context campaign' do
        context_campaign.update!(context: create(:phase), enabled: false)
        expect(service).to receive(:process_command).with(global_campaign, anything).once
        expect(service).not_to receive(:process_command).with(context_campaign, anything)
        service.send_on_activity(activity)
      end
    end
  end

  describe 'send_now' do
    let!(:campaign) { create(:manual_campaign) }
    let!(:users) { create_list(:user, 3) }

    it 'created a different command for each recipient' do
      expect(service.send_now(campaign).length).to eq User.count
    end

    it 'launches deliver_later on an ActionMailer' do
      expect { service.send_now(campaign) }.to have_enqueued_job(ActionMailer::MailDeliveryJob).exactly(User.count).times
    end

    it 'creates deliveries for a Trackable campaign' do
      service.send_now(campaign)
      expect(EmailCampaigns::Delivery.count).to eq User.count
    end
  end

  describe 'send_on_schedule with scheduled manual campaign' do
    let!(:campaign) do
      c = create(:manual_campaign)
      c.update_column(:scheduled_at, 1.hour.ago)
      c.reload
    end
    let!(:users) { create_list(:user, 3) }

    it 'sends a manual campaign when scheduled_at has passed' do
      expect { service.send_on_schedule(Time.zone.now) }
        .to have_enqueued_job(ActionMailer::MailDeliveryJob)
        .at_least(1).times
    end

    it 'does not send a manual campaign when scheduled_at is in the future' do
      campaign.update_column(:scheduled_at, 2.hours.from_now)
      expect { service.send_on_schedule(Time.zone.now) }
        .not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end

    it 'does not send a manual campaign without scheduled_at' do
      campaign.update_column(:scheduled_at, nil)
      expect { service.send_on_schedule(Time.zone.now) }
        .not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end

    it 'does not re-send an already sent scheduled campaign' do
      create(:delivery, campaign: campaign)
      expect { service.send_on_schedule(Time.zone.now) }
        .not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end
  end

  describe 'consentable_campaign_types_for' do
    let(:user) { create(:user) }

    before do
      NonConsentableCampaignForTest.create!
      ConsentableCampaignForTest.create!
      ConsentableDisableableCampaignAForTest.create!(enabled: false)
      ConsentableDisableableCampaignBForTest.create!(enabled: true)

      allow(service).to receive(
        :campaign_classes
      ).and_return(
        [
          NonConsentableCampaignForTest,
          ConsentableCampaignForTest,
          ConsentableDisableableCampaignAForTest,
          ConsentableDisableableCampaignBForTest
        ]
      )
    end

    it 'returns all campaign types that return true to #consentable_for?, for the given user and have an enabled campaign' do
      expect(service.consentable_campaign_types_for(user)).to include('ConsentableCampaignForTest', 'ConsentableDisableableCampaignBForTest')
    end

    it 'does not return all campaign types that return false to #consentable_for?, for the given user and have an enabled campaign' do
      expect(service.consentable_campaign_types_for(user)).not_to include('ConsentableDisableableCampaignAForTest')
    end
  end

  describe 'preview_email' do
    let(:recipient) { create(:user) }

    context 'Manual Campaign' do
      let(:campaign) { create(:manual_campaign, subject_multiloc: { en: 'MANUAL CAMPAIGN' }) }

      it 'returns a preview for manual campaigns' do
        preview = service.preview_email(campaign, recipient)
        expect(preview).to be_a(Hash)
        expect(preview[:subject]).to eq('MANUAL CAMPAIGN')
        expect(preview[:html]).to start_with('<!doctype html>')
      end
    end

    context 'Automated Campaigns' do
      EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.each do |campaign_class|
        it "returns preview details for #{campaign_class}" do
          campaign = campaign_class.new(subject_multiloc: { en: 'AUTOMATED CAMPAIGN' })
          if campaign.respond_to?(:preview_command)
            preview = service.preview_email(campaign, recipient)
            expect(preview).to be_a(Hash)
            expect(preview[:subject]).to eq('AUTOMATED CAMPAIGN')
            expect(preview[:html]).to start_with('<!doctype html>')
          end
        end
      end
    end
  end
end
