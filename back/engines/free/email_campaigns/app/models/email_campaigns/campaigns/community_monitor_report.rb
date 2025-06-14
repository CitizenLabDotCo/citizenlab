# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id                   :uuid             not null, primary key
#  type                 :string           not null
#  author_id            :uuid
#  enabled              :boolean
#  sender               :string
#  reply_to             :string
#  schedule             :jsonb
#  subject_multiloc     :jsonb
#  body_multiloc        :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deliveries_count     :integer          default(0), not null
#  context_id           :uuid
#  custom_text_multiloc :jsonb
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
  class Campaigns::CommunityMonitorReport < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable

    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admins_moderators_only
    recipient_filter :user_filter_no_invitees

    before_send :content_worth_sending?

    def mailer_class
      CommunityMonitorReportMailer
    end

    def self.default_schedule
      start_time = AppConfiguration.timezone.local(2025)
      IceCube::Schedule.new(start_time) do |schedule|
        first_day_of_quarter_at10_am = IceCube::Rule
          .monthly(3)
          .day_of_month(1)
          .hour_of_day(10)
        schedule.add_recurrence_rule(first_day_of_quarter_at10_am)
      end
    end

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins_and_managers_managing_the_project'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def generate_commands(recipient:)
      [{
        event_payload: {
          report_url: "#{Frontend::UrlService.new.home_url(locale: Locale.new(recipient.locale))}/admin/community-monitor/reports"
        }
      }]
    end

    private

    def user_filter_admins_moderators_only(users_scope, _options = {})
      return users_scope.admin unless community_monitor_service.phase

      users_scope.admin.or(users_scope.project_moderator(community_monitor_service.project_id))
    end

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def content_worth_sending?(_)
      return false unless community_monitor_service.phase

      report = community_monitor_service.find_or_create_previous_quarter_report
      return false unless report

      true
    end

    def community_monitor_service
      @community_monitor_service ||= CommunityMonitorService.new
    end
  end
end
