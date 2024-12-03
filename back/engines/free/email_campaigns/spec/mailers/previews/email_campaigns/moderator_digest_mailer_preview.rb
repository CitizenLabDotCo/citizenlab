# frozen_string_literal: true

module EmailCampaigns
  class ModeratorDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ModeratorDigest.first
      top_ideas = Idea.published.first(3)
      proposal = Idea.published.last
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient_user)
      project = Idea.first.project
      project_id = project.id
      project_title = project.title_multiloc[recipient_user.locale] || project.title_multiloc[I18n.default_locale]

      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          project_id: project_id,
          project_title: project_title,
          statistics: {
            new_ideas_increase: 3,
            new_comments_increase: 2,
            new_participants_increase: 0
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
          has_new_ideas: true,
          successful_proposals: [
            {
              id: proposal.id,
              title_multiloc: proposal.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(proposal),
              published_at: proposal.published_at&.iso8601 || Time.now.iso8601,
              author_name: name_service.display_name!(proposal.author),
              likes_count: proposal.likes_count,
              comments_count: proposal.comments_count
            }
          ]
        },
        tracked_content: {
          idea_ids: [*top_ideas.map(&:id), proposal.id]
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
