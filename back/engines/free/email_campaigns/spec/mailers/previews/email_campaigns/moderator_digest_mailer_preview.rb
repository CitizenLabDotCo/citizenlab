# frozen_string_literal: true

module EmailCampaigns
  class ModeratorDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ModeratorDigest.first
      top_ideas = Idea.first(3)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient_user)
      project = Idea.first.project
      project_id = project.id
      project_name = project.title_multiloc[recipient_user.locale] || project.title_multiloc[I18n.default_locale]

      command = {
        recipient: recipient_user,
        event_payload: {
          project_id: project_id,
          project_name: project_name,
          statistics: {
            activities: {
              new_ideas_increase: 3,
              new_comments_increase: 2
            },
            users: {
              new_participants_increase: 0
            }
          },
          top_ideas: top_ideas.map do |idea|
            new_reactions = idea.reactions.where('created_at > ?', Time.now - 7)
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
