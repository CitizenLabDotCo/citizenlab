require "rails_helper"

describe EmailCampaigns::DeliveryService do
  let(:service) { EmailCampaigns::DeliveryService.new }

  describe "campaign_types" do
    it "returns all campaign types" do
      expect(service.campaign_types).to_not be_empty
    end

    it "returns campaign_types that all have at least 1 campaign_type_description translation defined" do
      multiloc_service = MultilocService.new
      service.campaign_types.each do |campaign_type|
        expect{multiloc_service.i18n_to_multiloc("email_campaigns.campaign_type_description.#{campaign_type.constantize.campaign_name}")}
          .to_not raise_error
      end
    end

    it "returns campaign_types that are all instantiatable without extra arguments, except for Manual campaign" do
      (service.campaign_types - ['EmailCampaigns::Campaigns::Manual']).each do |campaign_type|
        expect{campaign_type.constantize.create!}.to_not raise_error
      end
    end
  end

  describe "send_on_schedule" do
    let(:campaign) { create(:admin_digest_campaign) }
    let!(:admin) { create(:admin) }

    it "enqueues an external event job" do
      travel_to campaign.ic_schedule.start_time do
        expectation = expect{service.send_on_schedule(Time.now)}
        expectation.to have_enqueued_job(PublishRawEventToSegmentJob)
        .exactly(1).times
        expectation.to have_enqueued_job(PublishRawEventToRabbitJob)
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
      expectation = expect{service.send_on_activity(activity)}
      expectation.to have_enqueued_job(PublishRawEventToSegmentJob)
      .exactly(1).times
      expectation.to have_enqueued_job(PublishRawEventToRabbitJob)
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
    it "returns all campaign types that return true to #consentable_for?, for the given user and have an enabled campaign" do
      class NonConsentableCampaign < EmailCampaigns::Campaign
      end
      class ConsentableCampaign < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable

        def self.consentable_roles
          []
        end
      end
      class ConsentableDisableableCampaignA < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable
        include EmailCampaigns::Disableable

        def self.consentable_roles
          []
        end
      end
      class ConsentableDisableableCampaignB < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable
        include EmailCampaigns::Disableable

        def self.consentable_roles
          []
        end
      end
      NonConsentableCampaign.create!
      ConsentableCampaign.create!
      ConsentableDisableableCampaignA.create!(enabled: false)
      ConsentableDisableableCampaignB.create!(enabled: false)
      ConsentableDisableableCampaignB.create!(enabled: true)
      stub_const(
        "EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES", 
        [NonConsentableCampaign, ConsentableDisableableCampaignA, ConsentableDisableableCampaignB, ConsentableCampaign]
      )
      user = create(:user)

      expect(service.consentable_campaign_types_for(user)).to match_array ["ConsentableCampaign", "ConsentableDisableableCampaignB"]
    end
  end

end
