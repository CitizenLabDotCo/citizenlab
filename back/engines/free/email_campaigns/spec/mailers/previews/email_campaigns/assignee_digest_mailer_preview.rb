# frozen_string_literal: true

module EmailCampaigns
  class AssigneeDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient_user)
      ideas = Idea.take(2)
      initiatives = Initiative.take(3)
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          assigned_ideas: ideas.map do |idea|
            {
              id: idea.id,
              title_multiloc: idea.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(idea),
              published_at: (idea.published_at&.iso8601 || Time.now.iso8601),
              assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601),
              author_name: name_service.display_name!(idea.author),
              likes_count: idea.likes_count,
              dislikes_count: idea.dislikes_count,
              comments_count: idea.comments_count
            }
          end,
          assigned_initiatives: initiatives.map do |initiative|
            {
              id: initiative.id,
              title_multiloc: initiative.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(initiative),
              published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
              assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
              author_name: name_service.display_name!(initiative.author),
              likes_count: initiative.likes_count,
              comments_count: initiative.comments_count,
              images: initiative.initiative_images.map do |image|
                {
                  ordering: image.ordering,
                  versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                }
              end,
              header_bg: {
                versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
              }
            }
          end,
          succesful_assigned_initiatives: initiatives.map do |initiative|
            {
              id: initiative.id,
              title_multiloc: initiative.title_multiloc,
              url: Frontend::UrlService.new.model_to_url(initiative),
              published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
              assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
              author_name: name_service.display_name!(initiative.author),
              likes_count: initiative.likes_count,
              comments_count: initiative.comments_count,
              threshold_reached_at: (initiative.threshold_reached_at&.iso8601 || Time.now.iso8601),
              images: initiative.initiative_images.map do |image|
                {
                  ordering: image.ordering,
                  versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                }
              end,
              header_bg: {
                versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
              }
            }
          end,
          need_feedback_assigned_ideas_count: 5
        }
      }
      campaign = EmailCampaigns::Campaigns::AssigneeDigest.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
