# frozen_string_literal: true

require 'rails_helper'

# TODO: move-old-proposals-test
RSpec.describe EmailCampaigns::AdminDigestMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::AdminDigest.create! }
    let_it_be(:command) do
      top_ideas = create_list(:idea, 3)
      successful_proposals = create_list(:proposal, 2)

      {
        recipient: recipient,
        event_payload: {
          statistics: {
            activities: {
              new_ideas: { increase: 1 },
              new_reactions: { increase: 1 },
              new_comments: { increase: 1 },
              total_ideas: 1,
              total_users: 3
            },
            users: {
              new_visitors: { increase: 1 },
              new_users: { increase: 1 },
              active_users: { increase: 1 }
            }
          },
          top_project_inputs: [
            {
              project: { url: 'some_fake_url', title_multiloc: { 'en' => 'project title' } },
              current_phase: nil,
              top_ideas: top_ideas.map { |idea| campaign.serialize_input(idea) }
            }
          ],
          successful_proposals: successful_proposals.map { |proposal| campaign.serialize_input(proposal) }
        },
        tracked_content: {
          idea_ids: []
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let_it_be(:mail_document) { Nokogiri::HTML.fragment(mail.html_part.body.raw_source) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

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

    it 'renders links to the top project ideas' do
      ideas_urls = command.dig(:event_payload, :top_project_inputs).first[:top_ideas].pluck(:url)
      first_idea_link = mail_document.css('.top-projects .idea a').first
      expect(first_idea_link.attr('href')).to eq(ideas_urls.first)
    end

    it 'renders the proposal that reached the threshold' do
      expect(mail_document.css('.successful-proposals .idea').length).to eq 2
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')))
    end
  end
end
