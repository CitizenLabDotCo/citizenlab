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
  class Campaigns::YourProposedInitiativesDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_authors_of_proposed_initiatives

    def self.default_schedule
      start_time = AppConfiguration.timezone.local(2019)
      IceCube::Schedule.new(start_time) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:wednesday).hour_of_day(14)
        )
      end
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.all_users_who_uploaded_proposals'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.proposals'
    end

    def mailer_class
      YourProposedInitiativesDigestMailer
    end

    def generate_commands(recipient:, time: nil)
      time ||= Time.now
      initiatives = recipient.initiatives.published.proposed.order(:published_at)
      if initiatives.present?
        [{
          event_payload: {
            initiatives: initiatives.includes(:initiative_images).map do |initiative|
              {
                title_multiloc: initiative.title_multiloc,
                body_multiloc: initiative.body_multiloc,
                url: Frontend::UrlService.new.model_to_url(initiative),
                published_at: initiative.published_at&.iso8601,
                likes_count: initiative.likes_count,
                reactions_needed: initiative.reactions_needed,
                reactions_this_week: initiative.likes.where('created_at > ?', time - 1.week).count,
                comments_count: initiative.comments_count,
                expires_at: initiative.expires_at.iso8601,
                status_code: initiative.initiative_status.code,
                images: initiative.initiative_images.map do |image|
                  {
                    ordering: image.ordering,
                    versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
                  }
                end,
                header_bg: {
                  versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
                }
              }
            end
          },
          tracked_content: {
            initiative_ids: initiatives.ids
          }
        }]
      else
        []
      end
    end

    private

    def filter_authors_of_proposed_initiatives(users_scope, _options = {})
      users_scope.where(id: Initiative.published.proposed.select(:author_id))
    end
  end
end
