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

    it 'returns campaign_types that are all instantiatable without extra arguments, except for Manual campaign' do
      (service.campaign_types - ['EmailCampaigns::Campaigns::Manual']).each do |campaign_type|
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
end
