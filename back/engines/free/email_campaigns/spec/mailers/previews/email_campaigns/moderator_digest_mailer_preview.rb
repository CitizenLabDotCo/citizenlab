module EmailCampaigns
  class ModeratorDigestMailerPreview < ActionMailer::Preview
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ModeratorDigest.first
      top_ideas = Idea.first(3)
      recipient = User.first
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)

      command = {
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
            new_votes = idea.votes.where('created_at > ?', Time.now - 7)
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
              comments_increment: idea.comments.where('created_at > ?', Time.now - 7).count
            }
          end,
          has_new_ideas: true
        },
        tracked_content: {
          idea_ids: [],
          initiative_ids: []
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
