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
#  title_multiloc       :jsonb
#  intro_multiloc       :jsonb
#  button_text_multiloc :jsonb
#  context_type         :string
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
  class Campaigns::ScreeningDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    include ContentConfigurable

    allow_lifecycle_stages only: ['active']

    recipient_filter :admins_and_moderators

    filter :content_worth_sending?

    def self.default_schedule
      start_time = AppConfiguration.timezone.at(0)

      IceCube::Schedule.new(start_time) do |schedule|
        schedule.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def mailer_class
      ScreeningDigestMailer
    end

    def self.consentable_roles
      %w[admin project_moderator]
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

    def generate_commands(recipient:, time: nil)
      screening_count = screening_count_for(recipient)
      return [] if screening_count.zero?

      [{ event_payload: { screening_count:, screening_url: } }]
    end

    private

    def admins_and_moderators(users_scope, _options = {})
      users_scope.admin_or_moderator.active
    end

    def content_worth_sending?(_)
      return false unless prescreening_status

      Idea.exists?(idea_status: prescreening_status)
    end

    def screening_count_for(recipient)
      return 0 unless prescreening_status

      projects = UserRoleService.new.moderatable_projects(recipient)
      Idea.where(idea_status: prescreening_status, project: projects).count
    end

    def screening_url
      url_service.input_manager_url(status: prescreening_status, tab: 'statuses')
    end

    def prescreening_status = @prescreening_status ||= IdeaStatus.find_by(code: 'prescreening')
    def url_service = @url_service ||= Frontend::UrlService.new
  end
end
