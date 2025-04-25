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

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let_it_be(:mail_document) { Nokogiri::HTML.fragment(mail.html_part.body.raw_source) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

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
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')))
    end
  end
end
