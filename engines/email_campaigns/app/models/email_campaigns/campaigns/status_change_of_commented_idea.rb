module EmailCampaigns
  class Campaigns::StatusChangeOfCommentedIdea < Campaign
    include Disableable
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_recipient

    def activity_triggers
      {'Idea' => {'changed_status' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope
        .where(id: activity.item.comments.pluck(:author_id))
        .where.not(id: activity.item.author_id)
    end

    def generate_commands recipient:, activity: 
      idea = activity.item
      status = idea.idea_status
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
          },
          idea_status: {
            id: status.id,
            title_multiloc: status.title_multiloc,
            code: status.code,
            color: status.color
          }
        }
      }]
    end
  end
end