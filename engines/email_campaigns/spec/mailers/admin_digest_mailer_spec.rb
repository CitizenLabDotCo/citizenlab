require 'rails_helper'

RSpec.describe EmailCampaigns::AdminDigestMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::AdminDigest.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let!(:top_ideas) { create_list(:idea, 3) }
    let!(:new_initiatives) { create_list(:initiative, 3) }
    let!(:successful_initiatives) { create_list(:initiative, 2) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          statistics: {
            activities: {
              new_ideas: { increase: 1 },
              new_initiatives: { increase: 1 },
              new_votes: { increase: 1 },
              new_comments: { increase: 1 },
              total_ideas: 1,
              total_initiatives: 2,
              total_users: 3
            },
            users: {
              new_visitors: { increase: 1 },
              new_users: { increase: 1 },
              active_users: { increase: 1 }
            }
          },
          top_project_ideas: [
            {
              project: { url: 'some_fake_url', title_multiloc: { 'en' => 'project title' } },
              current_phase: nil,
              top_ideas: top_ideas.map { |idea| campaign.serialize_idea(idea) }
            }
          ],
          new_initiatives: new_initiatives.map { |initiative| campaign.serialize_initiative(initiative) },
          successful_initiatives: successful_initiatives.map { |initiative| campaign.serialize_initiative(initiative) }
        },
        tracked_content: {
          idea_ids: [],
          initiative_ids: []
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:mail_document) { Nokogiri::HTML.fragment(mail.body.encoded) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your weekly admin report')
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

    it 'shows all ideas' do
      expect(mail_document.css('.idea').length).to eq 3
    end

    it 'shows all initiatives' do
      expect(mail_document.css('.initiative').length).to eq 5
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: 'en'))
    end
  end
end
