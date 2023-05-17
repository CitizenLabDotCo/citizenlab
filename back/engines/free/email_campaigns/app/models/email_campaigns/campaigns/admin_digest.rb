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
  class Campaigns::AdminDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable

    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admin_only
    recipient_filter :user_filter_no_invitees

    before_send :content_worth_sending?

    N_TOP_IDEAS = 12

    def self.default_schedule
      config_timezone = Time.find_zone(AppConfiguration.instance.settings('core', 'timezone'))

      IceCube::Schedule.new(config_timezone.local(2019)) do |schedule|
        every_monday_at10_am = IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        schedule.add_recurrence_rule(every_monday_at10_am)
      end
    end

    def mailer_class
      AdminDigestMailer
    end

    def self.consentable_roles
      ['admin']
    end

    def self.category
      'admin'
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def generate_commands(recipient:, time: Time.now)
      [{
        event_payload: {
          statistics: statistics,
          top_project_ideas: top_project_ideas,
          new_initiatives: new_initiatives(time: time),
          successful_initiatives: successful_initiatives(time: time)
        },
        tracked_content: {
          idea_ids: idea_ids(time: time),
          initiative_ids: initiative_ids(time: time)
        }
      }]
    end

    private

    def initiative_ids(time:)
      @initiative_ids ||= (new_initiatives(time: time) + successful_initiatives(time: time)).pluck(:id).compact
    end

    def idea_ids(time:)
      @idea_ids ||= top_project_ideas.flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
    end

    def user_filter_admin_only(users_scope, _options = {})
      users_scope.admin
    end

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def content_worth_sending?(_)
      [
        statistics.dig(:activities, :new_ideas, :increase),
        statistics.dig(:activities, :new_initiatives, :increase),
        statistics.dig(:activities, :new_comments, :increase),
        statistics.dig(:users, :new_visitors, :increase),
        statistics.dig(:users, :new_users, :increase),
        statistics.dig(:users, :active_users, :increase)
      ].any?(&:positive?)
    end

    def statistics
      @statistics ||= {
        activities: {
          new_ideas: stat_increase(Idea.pluck(:published_at).compact),
          new_initiatives: stat_increase(Initiative.pluck(:published_at).compact),
          new_votes: stat_increase(Vote.pluck(:created_at)),
          new_comments: stat_increase(Comment.pluck(:created_at)),
          total_ideas: Idea.count,
          total_initiatives: Initiative.count,
          total_users: User.count
        },
        users: {
          new_visitors: stat_increase,
          new_users: stat_increase(User.pluck(:registration_completed_at).compact),
          active_users: stat_increase
        }
      }
    end

    def days_ago
      t1, t2 = ic_schedule.first 2
      t2 ||= t1 + 7.days
      ((t2 - t1) / 1.day).days
    end

    def stat_increase(stats = [])
      second_last_agos = stats.select { |t| t > (Time.now - (days_ago * 2)) }
      last_agos = second_last_agos.select { |t| t > (Time.now - days_ago) }
      {
        increase: last_agos.size,
        past_increase: second_last_agos.size
      }
    end

    def top_project_ideas
      @top_project_ideas ||= Project.where(id: top_project_ids).map do |project|
        phase = TimelineService.new.current_phase project
        {
          project: serialize_project(project),
          current_phase: phase ? serialize_phase(phase) : nil,
          top_ideas: top_ideas_grouped_by_project[project.id].map { |idea| serialize_idea(idea) }
        }
      end
    end

    def top_project_ids
      project_ideas_total_activity_sum = lambda { |project_id|
        top_ideas_grouped_by_project[project_id].sum { |idea| total_idea_activity(idea) }
      }

      @top_project_ids ||= top_ideas_grouped_by_project.keys.sort_by(&project_ideas_total_activity_sum).reverse
    end

    def top_ideas_grouped_by_project
      @top_ideas_grouped_by_project ||= top_ideas.group_by(&:project_id)
    end

    def top_ideas
      @top_ideas ||= new_ideas.concat(active_ideas).uniq(&:id).select do |idea|
        idea.participation_method_on_creation.include_data_in_email?
      end
    end

    def active_ideas
      @active_ideas ||= published_ideas.then do |ideas|
        ideas.select { |idea| total_idea_activity(idea).positive? }
          .sort_by { |idea| total_idea_activity(idea) }
          .last(N_TOP_IDEAS)
      end
    end

    def new_ideas
      @new_ideas ||= published_ideas.where('published_at > ?', Time.now - days_ago)
        .sort_by { |idea| total_idea_activity(idea) }
        .last(N_TOP_IDEAS)
    end

    def published_ideas
      @published_ideas ||= Idea.published
    end

    def published_ideas_activity
      @published_ideas_activity ||= ideas_activity_counts(published_ideas)
    end

    def total_idea_activity(idea)
      published_ideas_activity.dig(idea.id, :total)
    end

    def idea_activity(idea, key)
      published_ideas_activity.dig(idea.id, key)
    end

    def new_initiatives(time: Time.zone.today)
      @new_initiatives ||= Initiative.published.where('published_at > ?', (time - 1.week))
        .order(published_at: :desc)
        .includes(:initiative_images)
        .map { |initiative| serialize_initiative(initiative) }
    end

    def successful_initiatives(time: Time.zone.today)
      @successful_initiatives ||= Initiative
        .published
        .joins(initiative_status_changes: :initiative_status)
        .includes(:initiative_images)
        .where(initiative_statuses: { code: 'threshold_reached' })
        .where('initiative_status_changes.created_at > ?', time - 1.week)
        .feedback_needed
        .map { |initiative| serialize_initiative(initiative) }
    end

    def ideas_activity_counts(ideas)
      idea_ids = ideas.pluck(:id)
      new_votes = Vote.where(votable_id: idea_ids).where('created_at > ?', Time.now - days_ago)
      new_upvotes_counts = new_votes.where(mode: 'up').group(:votable_id).count
      new_downvotes_counts = new_votes.where(mode: 'down').group(:votable_id).count
      new_comments_counts = Comment.where(post_id: idea_ids).where('created_at > ?', Time.now - days_ago).group(:post_id).count

      idea_ids.each_with_object({}) do |idea_id, object|
        upvotes         = (new_upvotes_counts[idea_id] || 0)
        downvotes       = (new_downvotes_counts[idea_id] || 0)
        comments        = (new_comments_counts[idea_id] || 0)
        total           = (upvotes + downvotes + comments)
        object[idea_id] = { upvotes: upvotes, downvotes: downvotes, comments: comments, total: total }
      end
    end

    public

    def serialize_project(project)
      {
        id: project.id,
        title_multiloc: project.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(project)
      }
    end

    def serialize_phase(phase)
      {
        id: phase.id,
        title_multiloc: phase.title_multiloc,
        participation_method: phase.participation_method,
        start_at: phase.start_at.iso8601,
        end_at: phase.end_at.iso8601
      }
    end

    def serialize_idea(idea)
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(idea),
        published_at: idea.published_at.iso8601,
        author_name: idea.author_name,
        upvotes_count: idea.upvotes_count,
        upvotes_increment: idea_activity(idea, :upvotes),
        downvotes_count: idea.downvotes_count,
        downvotes_increment: idea_activity(idea, :downvotes),
        comments_count: idea.comments_count,
        comments_increment: idea_activity(idea, :comments)
      }
    end

    def serialize_initiative(initiative)
      {
        id: initiative.id,
        title_multiloc: initiative.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(initiative),
        published_at: initiative.published_at&.iso8601,
        author_name: initiative.author_name,
        upvotes_count: initiative.upvotes_count,
        comments_count: initiative.comments_count,
        threshold_reached_at: initiative.threshold_reached_at&.iso8601,
        images: initiative.initiative_images.map { |image| serialize_image(image) },
        header_bg: { versions: version_urls(initiative.header_bg) }
      }
    end

    def serialize_image(image)
      {
        ordering: image.ordering,
        versions: version_urls(image.image)
      }
    end

    def version_urls(image)
      image.versions.to_h { |k, v| [k.to_s, v.url] }
    end
  end
end
