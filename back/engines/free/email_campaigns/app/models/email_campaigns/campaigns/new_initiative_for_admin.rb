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
  class Campaigns::NewInitiativeForAdmin < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def self.consentable_roles
      ['admin']
    end

    def mailer_class
      NewInitiativeForAdminMailer
    end

    def activity_triggers
      { 'Initiative' => { 'published' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      initiative = activity.item
      initiator = initiative.author

      recipient_ids = if initiator && !initiator.admin?
        User.admin.ids.reject do |recipient_id|
          recipient_id == initiative&.assignee_id
        end
      else
        []
      end

      users_scope.where(id: recipient_ids)
    end

    def self.category
      'admin'
    end

    def self.recipient_role_label
      I18n.t('email_campaigns.admin_labels.recipient_role.admins')
    end

    def self.recipient_segment_label
      I18n.t('email_campaigns.admin_labels.recipient_segment.admins_and_managers')
    end

    def self.content_type_label
      I18n.t('email_campaigns.admin_labels.content_type.proposals')
    end

    def self.trigger_label
      I18n.t('email_campaigns.admin_labels.trigger.new_proposal_is_posted')
    end

    def generate_commands(recipient:, activity:, time: nil)
      initiative = activity.item
      [{
        event_payload: {
          post_published_at: initiative.published_at.iso8601,
          post_title_multiloc: initiative.title_multiloc,
          post_author_name: initiative.author_name,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
