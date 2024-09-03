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
      %w[admin project_moderator] # TODO: Only project/folder moderators
    end

    def mailer_class
      NewIdeaForAdminMailer
    end

    def activity_triggers
      { 'Idea' => { 'submitted' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      input = activity.item
      initiator = input.author
      return users_scope.none if UserRoleService.new.moderates_something? initiator

      UserRoleService.new.moderators_for(input, users_scope) # TODO: Only project/folder moderators
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers' # TODO: Only project/folder moderators
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins_and_managers' # TODO: Only project/folder moderators
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.inputs'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.new_input_is_published'
    end

    def generate_commands(recipient:, activity:, time: nil)
      idea = activity.item
      return [] if !idea.participation_method_on_creation.supports_posting?

      [{
        event_payload: {
          post_submitted_at: idea.submitted_at&.iso8601,
          post_published_at: idea.published_at&.iso8601,
          post_title_multiloc: idea.title_multiloc,
          post_author_name: idea.author_name,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale)),
          post_publication_status: idea.publication_status
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
