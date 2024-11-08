# frozen_string_literal: true

require 'rails_helper'

# TODO: move-old-proposals-test
RSpec.describe EmailCampaigns::UserDigestMailer do
  describe 'UserDigest' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::UserDigest.create! }
    let_it_be(:proposal) { create(:proposal) }
    let_it_be(:idea) { create(:idea) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          notifications_count: 2,
          top_ideas: [
            {
              title_multiloc: idea.title_multiloc,
              body_multiloc: idea.body_multiloc,
              author_name: 'Ned Chipshop',
              likes_count: idea.likes_count,
              dislikes_count: idea.dislikes_count,
              comments_count: idea.comments_count,
              published_at: idea.published_at&.iso8601,
              url: 'http://www.example.com/idea',
              idea_images: [],
              top_comments: []
            }
          ],
          discover_projects: [],
          successful_proposals: [
            {
              id: proposal.id,
              title_multiloc: proposal.title_multiloc,
              url: 'http://www.example.com/proposal',
              published_at: proposal.published_at&.iso8601,
              author_name: 'Bob Muttcutts',
              likes_count: proposal.likes_count,
              dislikes_count: nil,
              comments_count: proposal.comments_count
            }
          ]
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your activity on')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'contains the ideas and proposals' do
      expect(mail.body.encoded).to match(idea.title_multiloc['en'])
      expect(mail.body.encoded).to match(proposal.title_multiloc['en'])
    end

    it 'assigns home url' do
      expect(mail.body.encoded).to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: Locale.new('en')))
    end

    describe 'when sent to users with a different locale set for each' do
      let_it_be(:campaign) { EmailCampaigns::Campaigns::UserDigest.create! }
      let_it_be(:event_payload) do
        {
          notifications_count: 2,
          top_ideas: [],
          discover_projects: [],
          successful_proposals: []
        }
      end

      let_it_be(:recipient1) { create(:user, locale: 'en') }
      let_it_be(:command1) { { recipient: recipient1, event_payload: event_payload } }

      let_it_be(:recipient2) { create(:user, locale: 'nl-NL') }
      let_it_be(:command2) { { recipient: recipient2, event_payload: event_payload } }

      let_it_be(:mail1) { described_class.with(command: command1, campaign: campaign).campaign_mail.deliver_now }
      let_it_be(:mail2) { described_class.with(command: command2, campaign: campaign).campaign_mail.deliver_now }

      it 'renders the mails in the correct language' do
        expect(mail1.body.encoded).to include('Discover what happened last week')
        expect(mail2.body.encoded).to include('Ontdek wat er vorige week is gebeurd')
      end
    end
  end
end
