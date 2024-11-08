# frozen_string_literal: true

require 'rails_helper'

# TODO: move-old-proposals-test
RSpec.describe EmailCampaigns::ModeratorDigestMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ModeratorDigest.create! }
    let_it_be(:project) { create(:single_phase_ideation_project) }
    let_it_be(:top_ideas) { create_list(:idea, 3, project: project) }
    let_it_be(:command) do
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)

      {
        recipient: recipient,
        event_payload: {
          project_title: project.title_multiloc[recipient.locale],
          project_id: project.id,
          statistics: {
            activities: {
              new_ideas: {
                increase: 3,
                past_increase: 4
              },
              new_reactions: {
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
            new_reactions = idea.reactions.where('created_at > ?', Time.now - days_ago)
            {
              id: idea.id,
              title_multiloc: idea.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(idea),
              published_at: idea.published_at.iso8601,
              author_name: name_service.display_name!(idea.author),
              likes_count: idea.likes_count,
              likes_increment: new_reactions.where(mode: 'up').count,
              dislikes_count: idea.dislikes_count,
              dislikes_increment: new_reactions.where(mode: 'down').count,
              comments_count: idea.comments_count,
              comments_increment: idea.comments.where('created_at > ?', Time.now - days_ago).count
            }
          end,
          has_new_ideas: true,
          successful_proposals: []
        },
        tracked_content: {
          idea_ids: [],
          initiative_ids: []
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    it 'renders the subject' do
      expect(mail.subject).to start_with('Weekly manager report')
      expect(mail.subject).to include(project.title_multiloc['en'])
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

    it 'assigns project URL to the button' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.admin_project_url(project.id))
    end
  end
end
