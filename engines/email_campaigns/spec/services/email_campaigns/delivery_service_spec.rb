require "rails_helper"

describe EmailCampaigns::DeliveryService do
  let(:service) { EmailCampaigns::DeliveryService.new }

  describe "campaign_types" do
    it "returns all campaign types" do
      expect(service.campaign_types).to_not be_empty
    end
  end

  describe "send_on_schedule" do
    let(:campaign) { create(:admin_digest_campaign) }
    let!(:admin) { create(:admin) }

    it "enqueues an external event job" do
      travel_to campaign.ic_schedule.start_time do
        expect{service.send_on_schedule(Time.now)}
          .to have_enqueued_job(PublishRawEventJob)
          .exactly(1).times
      end
    end

    it "creates deliveries for a trackable campaign" do
      travel_to campaign.ic_schedule.start_time do
        service.send_on_schedule(Time.now)
        expect(EmailCampaigns::Delivery.first).to have_attributes({
          campaign_id: campaign.id,
          user_id: admin.id,
          delivery_status: 'sent'
        })
      end
    end
  end

  describe "send_on_activity" do
    let!(:campaign) { create(:comment_on_your_comment_campaign) }
    let(:notification) { create(:comment_on_your_comment) }
    let(:activity) { 
      Activity.create(
        item: notification,
        item_type: notification.class.name,
        action: 'created',
        acted_at: Time.now
      )
    }
    let(:user) { create(:user) }

    it "enqueues an external event job" do
      expect{service.send_on_activity(activity)}
        .to have_enqueued_job(PublishRawEventJob)
        .exactly(1).times
      expect(EmailCampaigns::Delivery.all).to be_empty
    end
  end

  describe "send_now" do
    let!(:campaign) { create(:manual_campaign) }
    let!(:users) { create_list(:user, 3) }

    it "launches deliver_later on an ActionMailer" do
      message_delivery = instance_double(ActionMailer::MessageDelivery)
      expect(EmailCampaigns::CampaignMailer)
        .to receive(:campaign_mail)
        .with(campaign, anything)
        .and_return(message_delivery)
        .exactly(User.count).times
      expect(message_delivery)
        .to receive(:deliver_later)
        .exactly(User.count).times

      service.send_now(campaign)

    end

    it "creates deliveries for a Trackable campaign" do
      service.send_now(campaign)
      expect(EmailCampaigns::Delivery.count).to eq User.count
    end
  end

  describe "consentable_campaign_types_for" do
    it "returns all campaign types that return true to #consentable_for?, for the given user" do
      class NonConsentableCampaign < EmailCampaigns::Campaign
      end
      class ConsentableCampaign < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable

        def self.consentable_roles
          []
        end
      end

      stub_const("EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES", [NonConsentableCampaign, ConsentableCampaign])
      user = create(:user)

      expect(service.consentable_campaign_types_for(user)).to eq ["ConsentableCampaign"]
    end
  end

end
