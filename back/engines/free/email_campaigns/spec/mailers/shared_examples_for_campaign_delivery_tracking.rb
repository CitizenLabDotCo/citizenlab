RSpec.shared_examples 'campaign delivery tracking' do
  describe 'campaign delivery tracking' do
    it 'creates the delivery and includes its ID in the tracking headers' do
      campaign.run_before_send_hooks(command)
      message = mailer.campaign_mail.deliver_now
      campaign.run_after_send_hooks(command)

      delivery = EmailCampaigns::Delivery.sole
      expect(message[EmailCampaigns::ApplicationMailer::TENANT_ID_HEADER].value).to eq(AppConfiguration.instance.id)
      expect(message[EmailCampaigns::ApplicationMailer::DELIVERY_ID_HEADER].value).to eq(delivery.id)
    end
  end
end
