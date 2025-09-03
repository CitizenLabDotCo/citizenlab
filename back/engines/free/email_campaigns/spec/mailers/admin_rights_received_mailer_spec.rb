# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::AdminRightsReceivedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::AdminRightsReceived.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {}
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('You became an administrator on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns the message box title (title_what_can_you_do_administrator)' do
      expect(mail_body(mail)).to match('What can you do as an administrator?')
    end

    it 'assigns moderate CTA' do
      expect(mail_body(mail)).to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')))
    end

    context 'when editable regions are customised' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom subject for {{organizationName}}' },
          title_multiloc: { 'en' => 'CUSTOM TITLE' },
          intro_multiloc: { 'en' => '<b>CUSTOM BODY TEXT</b>' }
        )
      end

      it 'renders the customised subject' do
        expect(mail.subject).to eq('Custom subject for Liege')
      end

      it 'renders the customised title' do
        expect(mail_body(mail)).to include('CUSTOM TITLE')
      end

      it 'renders the customised intro as html' do
        expect(mail_body(mail)).to include('<b>CUSTOM BODY TEXT</b>')
      end
    end
  end
end
