# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ReportGeneratedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en', first_name: 'Remy') }
    let(:stopped_early) { false }
    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_title_multiloc: { 'en' => 'Example project title' },
          report_url: 'https://govocal.com/admin/reporting/report-builder/1/editor',
          stopped_early: stopped_early
        }
      }
    end

    let(:campaign) { create(:report_generated_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq "Your report for 'Example project title' is ready"
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'names the project the report is about' do
      expect(body).to include 'Example project title'
    end

    it 'links to the report' do
      expect(body).to include 'https://govocal.com/admin/reporting/report-builder/1/editor'
    end

    it 'says nothing about an unfinished run when the report is whole' do
      expect(body).not_to include 'stopped before the report was finished'
    end

    context 'when the run stopped before it was done' do
      let(:stopped_early) { true }

      # The text lives under the campaign's own keys, so a view-scoped lookup
      # renders a "translation missing" marker instead of this.
      it 'tells the admin the report may not be whole' do
        expect(body).to include 'The writing stopped before the report was finished'
      end
    end
  end
end
