# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaPublishedMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::IdeaPublished.create! }
    let_it_be(:input) { create(:idea, author: recipient) }
    let_it_be(:activity) { create(:activity, item: input, action: 'published') }
    let_it_be(:command) do
      create(:idea_published_campaign).generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:body) { mail_body(mail) }

    describe 'mailgun_headers' do
      it 'includes X-Mailgun-Variables in headers' do
        # We need to do this as we cannot directly access the true mailer instance
        # when using `described_class.with(...)` in the test setup.
        mailer_instance = nil
        allow(described_class).to receive(:new).and_wrap_original do |original, *args|
          mailer_instance = original.call(*args)
          allow(mailer_instance).to receive(:mailgun_headers).and_call_original
          mailer_instance
        end

        campaign.run_before_send_hooks(activity:)
        mailer.campaign_mail.deliver_now
        campaign.run_after_send_hooks(command)

        expect(mailer_instance.mailgun_headers).to have_key('X-Mailgun-Variables')
        mailgun_variables = JSON.parse mailer_instance.mailgun_headers['X-Mailgun-Variables']
        expect(mailgun_variables).to match(
          hash_including(
            'cl_tenant_id' => instance_of(String),
            'cl_delivery_id' => instance_of(String)
          )
        )
        expect(EmailCampaigns::Delivery.ids).to eq [mailgun_variables['cl_delivery_id']]
      end
    end

    it 'renders the subject' do
      expect(mail.subject).to eq('Your idea has been published')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/You posted/)
        end
      end
    end

    it 'includes the input box' do
      expect(body).to have_tag('table') do
        with_tag 'p' do
          with_text(/Reach more people/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: "http://example.org/en/ideas/#{input.slug}" }) do
        with_text(/Go to your idea/)
      end
    end
  end
end
