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
  class Campaigns::AssigneeDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admins_moderators_only

    N_TOP_IDEAS = 12

    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(AppConfiguration.instance.settings('core', 'timezone')).local(2019)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:tuesday).hour_of_day(8)
        )
      end
    end

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def self.category
      'admin'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_moderators'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.ideas'
    end

    def self.trigger_multiloc_key
      'scheduled'
    end

    def mailer_class
      AssigneeDigestMailer
    end

    def generate_commands(recipient:, time: nil)
      time ||= Time.now
      assigned = {
        assigned_ideas: assigned_ideas(recipient: recipient, time: time),
        assigned_initiatives: assigned_initiatives(recipient: recipient, time: time),
        succesful_assigned_initiatives: succesful_assigned_initiatives(recipient: recipient, time: time)
      }
      tracked_content = {
        idea_ids: assigned[:assigned_ideas].pluck(:id).compact,
        initiative_ids: (assigned[:assigned_initiatives] + assigned[:succesful_assigned_initiatives]).pluck(:id).compact
      }
      if assigned.values.any?(&:present?)
        [{
          event_payload: {
            **assigned,
            need_feedback_assigned_ideas_count: StatIdeaPolicy::Scope.new(recipient, Idea.published).resolve.where(assignee: recipient).feedback_needed.count
          },
          tracked_content: tracked_content
        }]
      else
        []
      end
    end

    private

    def user_filter_admins_moderators_only(users_scope, _options = {})
      users_scope.admin.or(users_scope.project_moderator)
    end

    def assigned_ideas(recipient:, time:)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.assigned_ideas
        .feedback_needed
        .order(published_at: :desc)
        .take(N_TOP_IDEAS)
        .map do |idea|
          {
            id: idea.id,
            title_multiloc: idea.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(idea),
            published_at: idea.published_at&.iso8601,
            assigned_at: idea.assigned_at&.iso8601,
            author_name: name_service.display_name!(idea.author),
            upvotes_count: idea.upvotes_count,
            downvotes_count: idea.downvotes_count,
            comments_count: idea.comments_count
          }
        end
    end

    def assigned_initiatives(recipient:, time:)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.assigned_initiatives.published
        .where('assigned_at > ?', time - 1.week)
        .order(assigned_at: :desc)
        .includes(:initiative_images)
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at&.iso8601,
          assigned_at: initiative.assigned_at&.iso8601,
          author_name: name_service.display_name!(initiative.author),
          upvotes_count: initiative.upvotes_count,
          comments_count: initiative.comments_count,
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
    end

    def succesful_assigned_initiatives(recipient:, time:)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      threshold_reached_id = InitiativeStatus.where(code: 'threshold_reached').ids.first
      recipient.assigned_initiatives
        .joins(:initiative_status_changes)
        .where(
          'initiative_status_changes.initiative_status_id = ? AND initiative_status_changes.created_at > ?',
          threshold_reached_id,
          (time - 1.week)
        )
        .feedback_needed
        .order(upvotes_count: :desc)
        .includes(:initiative_images)
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at&.iso8601,
          assigned_at: initiative.assigned_at&.iso8601,
          author_name: name_service.display_name!(initiative.author),
          upvotes_count: initiative.upvotes_count,
          comments_count: initiative.comments_count,
          threshold_reached_at: initiative.threshold_reached_at&.iso8601,
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
    end
  end
end
