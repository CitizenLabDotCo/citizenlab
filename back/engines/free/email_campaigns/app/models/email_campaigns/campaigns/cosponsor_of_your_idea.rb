# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id               :uuid             not null, primary key
#  type             :string           not null
#  author_id        :uuid
#  enabled          :boolean
#  sender           :string
#  reply_to         :string
#  schedule         :jsonb
#  subject_multiloc :jsonb
#  body_multiloc    :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  deliveries_count :integer          default(0), not null
#  context_id       :uuid
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_type        (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::CosponsorOfYourIdea < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      CosponsorOfYourIdeaMailer
    end

    def activity_triggers
      { 'Notifications::CosponsorOfYourIdea' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_published_the_proposal'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.proposals'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.user_accepts_invitation_to_cosponsor_a_proposal'
    end

    def generate_commands(recipient:, activity:)
      idea = activity.item.idea
      cosponsor = activity.item.initiating_user
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)

      [{
        event_payload: {
          post_title_multiloc: idea.title_multiloc,
          post_body_multiloc: idea.body_multiloc,
          post_author_name: name_service.display_name!(idea.author),
          post_cosponsor_name: name_service.display_name!(cosponsor),
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale)),
          post_image_medium_url: post_image_medium_url(idea)
        }
      }]
    end

    private

    def post_image_medium_url(idea)
      image = idea&.idea_images&.first
      image.image.versions[:medium].url if image&.image&.versions
    end
  end
end
