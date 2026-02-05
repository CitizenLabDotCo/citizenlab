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

    MAX_PROJECTS = 10

    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admins_and_moderators
    recipient_filter :user_filter_no_invitees

    filter :content_worth_sending?

    def self.default_schedule
      start_time = AppConfiguration.timezone.local(2019)

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
      all_projects_data = all_projects_with_screening_inputs_for(recipient)
      return [] if all_projects_data.empty?

      total_count = all_projects_data.sum { |p| p[:screening_count] }
      limited_projects = all_projects_data.first(MAX_PROJECTS)

      [{
        event_payload: {
          total_screening_count: total_count,
          projects: limited_projects,
          screening_overview_url: screening_overview_url
        }
      }]
    end

    private

    def user_filter_admins_and_moderators(users_scope, _options = {})
      users_scope.where("roles @> '[{\"type\":\"admin\"}]' OR roles @> '[{\"type\":\"project_moderator\"}]'")
    end

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def content_worth_sending?(_)
      prescreening_status = IdeaStatus.find_by(code: 'prescreening')
      return false unless prescreening_status

      Idea.where(idea_status: prescreening_status).exists?
    end

    def all_projects_with_screening_inputs_for(recipient)
      prescreening_status = IdeaStatus.find_by(code: 'prescreening')
      return [] unless prescreening_status

      # Admins see all projects, moderators see only their moderated projects
      project_ids = if recipient.admin?
                      nil # No filter - all projects
                    else
                      recipient.moderatable_project_ids
                    end

      ideas_query = Idea.where(idea_status: prescreening_status)
      ideas_query = ideas_query.where(project_id: project_ids) if project_ids.present?
      ideas_query = ideas_query.where.not(project_id: nil)

      ideas_by_project = ideas_query.group(:project_id).count

      return [] if ideas_by_project.empty?

      Project.where(id: ideas_by_project.keys).map do |project|
        {
          project_id: project.id,
          title_multiloc: project.title_multiloc,
          screening_count: ideas_by_project[project.id],
          screening_url: screening_url_for_project(project.id)
        }
      end.sort_by { |p| -p[:screening_count] }
    end

    def prescreening_status_id
      @prescreening_status_id ||= IdeaStatus.find_by(code: 'prescreening')&.id
    end

    def screening_url_for_project(project_id)
      "#{Frontend::UrlService.new.admin_project_url(project_id)}/ideas?status=#{prescreening_status_id}&tab=statuses"
    end

    def screening_overview_url
      "#{Frontend::UrlService.new.admin_ideas_url}?status=#{prescreening_status_id}&tab=statuses"
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
