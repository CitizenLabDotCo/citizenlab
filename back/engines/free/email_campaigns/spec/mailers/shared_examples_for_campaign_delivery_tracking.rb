RSpec.shared_examples 'campaign delivery tracking' do
  describe 'campaign delivery tracking' do
    it 'creates the delivery and includes its ID in the Mailgun headers' do
      # We need to do this as we cannot directly access the true mailer instance
      # when using `described_class.with(...)` in the test setup.
      mailer_instance = nil
      allow(described_class).to receive(:new).and_wrap_original do |original, *args|
        mailer_instance = original.call(*args)
        allow(mailer_instance).to receive(:mailgun_headers).and_call_original
        mailer_instance
      end

      campaign.run_before_send_hooks(command)
      mailer.campaign_mail.deliver_now
      campaign.run_after_send_hooks(command)

      expect(mailer_instance.mailgun_headers.keys).to eq %w[X-Mailgun-Variables]
      mailgun_variables = JSON.parse mailer_instance.mailgun_headers['X-Mailgun-Variables']
      expect(mailgun_variables).to match(
        hash_including(
          'cl_tenant_id' => instance_of(String),
          'cl_delivery_id' => EmailCampaigns::Delivery.order(:created_at).last.id
        )
      )
      expect(EmailCampaigns::Delivery.ids).to eq [mailgun_variables['cl_delivery_id']]
    end
  end
end
