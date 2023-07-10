# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::VotingLastChanceMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::VotingLastChance.create! }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale),
          project_title_multiloc: project.title_multiloc,
          phase_title_multiloc: project.phases.first.title_multiloc
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject including phase title' do
      expect(mail.subject).to match 'Last chance to vote'
      expect(mail.subject).to match project.phases.first.title_multiloc['en']
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'displays the correct body - including project title' do
      expect(mail.body.encoded).to match 'Time is running out'
      expect(mail.body.encoded).to match project.title_multiloc['en']
    end

    it "displays 'Vote' button with correct link" do
      project_url = Frontend::UrlService.new.model_to_url(project, locale: recipient.locale)
      expect(mail.body.encoded).to match project_url
      expect(mail.body.encoded).to match 'Vote'
    end
  end
end
