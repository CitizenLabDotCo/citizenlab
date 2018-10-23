module EmailCampaigns
  class Campaigns::NewCommentOnVotedIdea < Campaign
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_recipient

    def activity_triggers
      {'Comment' => {'created' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope
        .where(id: activity.item.idea.votes.pluck(:user_id))
        .where.not(id: activity.item.author_id)
        .where.not(id: activity.item.idea.author_id)
        .where.not(id: activity.item.idea.comments.pluck(:author_id))
    end

    def generate_commands recipient:, activity: 
      comment = activity.item
      [{
        event_payload: {
          comment: {
            id: comment.id,
            body_multiloc: comment.body_multiloc,
            url: FrontendService.new.model_to_url(comment, locale: recipient.locale)
          }
        }
      }]
    end
  end
end