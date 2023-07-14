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
  class Campaigns::VotingBasketSubmitted < Campaign
    include Consentable
    include ActivityTriggerable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_recipient

    def mailer_class
      VotingBasketSubmittedMailer
    end

    def activity_triggers
      { 'Notifications::VotingBasketSubmitted' => { 'created' => true } }
    end

    def filter_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_voted'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.voting'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.voting_basket_submitted'
    end

    def generate_commands(recipient:, activity:)
      basket = activity.item.basket
      [{
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(basket.participation_context.project, locale: recipient.locale),
          voted_ideas: format_ideas_list(basket.ideas, recipient)
        }
      }]
    end

    def format_ideas_list(ideas, recipient)
      ideas.map do |idea|
        {
          title_multiloc: idea.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          images: idea.idea_images.map do |image|
            {
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end
        }
      end
    end
  end
end
