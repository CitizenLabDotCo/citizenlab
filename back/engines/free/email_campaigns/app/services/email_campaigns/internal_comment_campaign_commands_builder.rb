# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentCampaignCommandsBuilder
    def build_commands(recipient, activity)
      notification = activity.item
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: name_service.last_name!(notification.initiating_user),
          internal_comment_author_name: name_service.display_name!(notification.internal_comment.author),
          internal_comment_body: notification.internal_comment.body,
          internal_comment_url: Frontend::UrlService.new.model_to_url(notification.internal_comment, locale: Locale.new(recipient.locale)),
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_type: notification.post_type,
          post_image_medium_url: post_image_medium_url(notification)
        }
      }]
    end

    def serialize_medium_image(image)
      image.image.versions[:medium].url if image&.image&.versions
    end

    private

    def post_image_medium_url(notification)
      if notification.post_type == 'Idea'
        serialize_medium_image(notification&.post&.idea_images&.first)
      elsif notification.post_type == 'Initiative'
        serialize_medium_image(notification&.post&.initiative_images&.first)
      end
    end
  end
end
