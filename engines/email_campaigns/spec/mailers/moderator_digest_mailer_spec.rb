require 'rails_helper'

RSpec.describe EmailCampaigns::ModeratorDigestMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::ModeratorDigest.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, recipient) }

    let!(:top_ideas) { create_list(:idea, 3) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          statistics: {
            activities: {
              new_ideas: {
                increase: 3,
                past_increase: 4
              },
              new_votes: {
                increase: 2,
                past_increase: 4
              },
              new_comments: {
                increase: 2,
                past_increase: 3
              },
              total_ideas: 100
            },
            users: {
              new_visitors: 0,
              new_participants: {
                increase: 0,
                past_increase: 3
              },
              total_participants: 0
            }
          },
          top_ideas: top_ideas.map do |idea|
            days_ago = campaign.send(:days_ago)
            new_votes = idea.votes.where('created_at > ?', Time.now - days_ago)
            {
              id: idea.id,
              title_multiloc: idea.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(idea),
              published_at: idea.published_at.iso8601,
              author_name: name_service.display_name!(idea.author),
              upvotes_count: idea.upvotes_count,
              upvotes_increment: new_votes.where(mode: 'up').count,
              downvotes_count: idea.downvotes_count,
              downvotes_increment: new_votes.where(mode: 'down').count,
              comments_count: idea.comments_count,
              comments_increment: idea.comments.where('created_at > ?', Time.now - days_ago).count
            }
          end,
          has_new_ideas: true
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
      expect(mail.subject).to start_with('Your weekly project manager report')
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
        .to match(Frontend::UrlService.new.home_url(app_configuration: AppConfiguration.instance, locale: 'en'))
    end
  end
end
