module EmailCampaigns
  class AssigneeDigestMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.first
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      ideas = Idea.take(2)
      initiatives = Initiative.take(3)
      command = {
        recipient: recipient,
        event_payload: {
          assigned_ideas: ideas.map{ |idea| {
            id: idea.id,
            title_multiloc: idea.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(idea),
            published_at: (idea.published_at&.iso8601 || Time.now.iso8601),
            assigned_at: (idea.assigned_at&.iso8601 || Time.now.iso8601),
            author_name: name_service.display_name!(idea.author),
            upvotes_count: idea.upvotes_count,
            downvotes_count: idea.downvotes_count,
            comments_count: idea.comments_count,
          }},
          assigned_initiatives: initiatives.map{ |initiative| {
            id: initiative.id,
            title_multiloc: initiative.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(initiative),
            published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
            assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
            author_name: name_service.display_name!(initiative.author),
            upvotes_count: initiative.upvotes_count,
            comments_count: initiative.comments_count,
            images: initiative.initiative_images.map{ |image|
              {
                ordering: image.ordering,
                versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            },
            header_bg: {
              versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          }},
          succesful_assigned_initiatives: initiatives.map{ |initiative| {
            id: initiative.id,
            title_multiloc: initiative.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(initiative),
            published_at: (initiative.published_at&.iso8601 || Time.now.iso8601),
            assigned_at: (initiative.assigned_at&.iso8601 || Time.now.iso8601),
            author_name: name_service.display_name!(initiative.author),
            upvotes_count: initiative.upvotes_count,
            comments_count: initiative.comments_count,
            threshold_reached_at: (initiative.threshold_reached_at&.iso8601 || Time.now.iso8601),
            images: initiative.initiative_images.map{ |image|
              {
                ordering: image.ordering,
                versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            },
            header_bg: {
              versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          }},
          need_feedback_assigned_ideas_count: 5
        }
      }
      campaign = EmailCampaigns::Campaigns::AssigneeDigest.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
