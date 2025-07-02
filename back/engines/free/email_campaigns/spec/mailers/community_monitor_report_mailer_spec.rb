# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommunityMonitorReportMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommunityMonitorReport.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          quarter: 1,
          year: 2025,
          report_url: 'https://example.com/report'
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:mail_document) { Nokogiri::HTML.fragment(mail.html_part.body.raw_source) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('A new community monitor report is available')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail_body(mail)).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns home url' do
      expect(mail_body(mail))
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')))
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject' },
          title_multiloc: { 'en' => 'NEW TITLE' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE')
      end

      it 'can customise the body including HTML' do
        expect(mail_body(mail)).to include('<b>NEW BODY TEXT</b>')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK THE BUTTON')
      end
    end
  end
end
