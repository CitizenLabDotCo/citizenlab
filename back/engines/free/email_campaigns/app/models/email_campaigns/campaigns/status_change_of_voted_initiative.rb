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
  class Campaigns::StatusChangeOfVotedInitiative < Campaign
    include ActivityTriggerable
    include Consentable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def mailer_class
      StatusChangeOfVotedInitiativeMailer
    end

    def activity_triggers
      { 'Initiative' => { 'changed_status' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope
        .where(id: activity.item.votes.pluck(:user_id))
        .where.not(id: activity.item.author_id)
        .where.not(id: activity.item.comments.pluck(:author_id))
    end

    def self.category
      'voted'
    end

    def generate_commands(recipient:, activity:)
      initiative = activity.item
      status = initiative.initiative_status
      [{
        event_payload: {
          post_id: initiative.id,
          post_title_multiloc: initiative.title_multiloc,
          post_body_multiloc: initiative.body_multiloc,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          post_images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          initiative_status_id: status.id,
          initiative_status_title_multiloc: status.title_multiloc,
          initiative_status_code: status.code,
          initiative_status_color: status.color
        }
      }]
    end

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
