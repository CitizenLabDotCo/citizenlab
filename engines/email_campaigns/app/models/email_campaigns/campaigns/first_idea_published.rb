module EmailCampaigns
  class Campaigns::FirstIdeaPublished < Campaign
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_recipient

    def activity_triggers
      {'Idea' => {'first_published_by_user' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.author_id)
    end

    def generate_commands recipient:, activity: 
      idea = activity.item
      [{
        event_payload: {
          idea: {
            id: idea.id,
            title_multiloc: idea.title_multiloc,
            body_multiloc: idea.body_multiloc,
            url: FrontendService.new.model_to_url(idea, locale: recipient.locale),
            idea_images: idea.idea_images.map{ |image|
              {
                ordering: image.ordering,
                versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
              }
            }
          }
        }
      }]
    end
  end
end