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
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_recipient

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def mailer_class
      NewIdeaForAdminMailer
    end

    def activity_triggers
      {'Idea' => {'published' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      idea = activity.item
      initiator = idea.author

      recipient_ids = if !(initiator&.admin? || initiator&.project_moderator?(idea.project_id))
        User.admin.or(User.project_moderator(idea.project_id)).ids
      else
        []
      end

      users_scope.where(id: recipient_ids)
    end

    def self.category
      'admin'
    end

    def generate_commands recipient:, activity:, time: nil
      idea = activity.item
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
      self.enabled = false if self.enabled.nil?
    end
  end
end

EmailCampaigns::Campaigns::NewIdeaForAdmin.prepend_if_ee(
  'IdeaAssignment::Patches::EmailCampaigns::Campaigns::NewIdeaForAdmin'
)
