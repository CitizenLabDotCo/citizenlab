# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::AdminDigestMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en', first_name: 'Bob', last_name: 'Jones') }
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

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }
    let_it_be(:mail_document) { Nokogiri::HTML.fragment(mail.html_part.body.raw_source) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

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
      expect(mail_body(mail)).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
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
      expect(mail_body(mail))
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')))
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ firstName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ firstName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Bob'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE FOR Bob')
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
