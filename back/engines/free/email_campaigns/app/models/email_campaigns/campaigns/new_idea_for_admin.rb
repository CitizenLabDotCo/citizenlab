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
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id  (author_id)
#  index_email_campaigns_campaigns_on_type       (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::NewIdeaForAdmin < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def mailer_class
      NewIdeaForAdminMailer
    end

    def activity_triggers
      { 'Idea' => { 'published' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      idea = activity.item
      initiator = idea.author

      recipient_ids = if initiator&.admin? || initiator&.project_moderator?(idea.project_id)
        []
      else
        User.admin.or(User.project_moderator(idea.project_id)).ids
      end

      users_scope.where(id: recipient_ids)
    end

    def self.category
      'admin'
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins_and_managers'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.inputs'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.new_input_is_published'
    end

    def generate_commands(recipient:, activity:, time: nil)
      idea = activity.item
      return [] unless idea.participation_method_on_creation.include_data_in_email?

      [{
        event_payload: {
          post_published_at: idea.published_at.iso8601,
          post_title_multiloc: idea.title_multiloc,
          post_author_name: idea.author_name,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale)
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end

EmailCampaigns::Campaigns::NewIdeaForAdmin.prepend(IdeaAssignment::Patches::EmailCampaigns::Campaigns::NewIdeaForAdmin)
