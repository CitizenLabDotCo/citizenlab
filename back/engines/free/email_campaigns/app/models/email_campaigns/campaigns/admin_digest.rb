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
      start_time = AppConfiguration.timezone.local(2019)

      IceCube::Schedule.new(start_time) do |schedule|
        every_monday_at10_am = IceCube::Rule
          .weekly(1)
          .day(:monday)
          .hour_of_day(10)

        schedule.add_recurrence_rule(every_monday_at10_am)
      end
    end

    def mailer_class
      AdminDigestMailer
    end

    def self.consentable_roles
      ['admin']
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
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
          statistics:,
          top_project_inputs:,
          successful_proposals: successful_proposals(time: time)
        },
        tracked_content: {
          idea_ids: idea_ids(time: time)
        }
      }]
    end

    private

    def idea_ids(time:)
      @idea_ids ||= (top_project_inputs.flat_map { |tpi| tpi[:top_ideas].pluck(:id) } + successful_proposals(time: time).pluck(:id)).compact.uniq
    end

    def user_filter_admin_only(users_scope, _options = {})
      users_scope.admin
    end

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def content_worth_sending?(_)
      [
        statistics[:new_inputs_increase],
        statistics[:new_comments_increase],
        statistics[:new_users_increase]
      ].any?(&:positive?)
    end

    def statistics
      @statistics ||= {
        new_inputs_increase: stat_increase(Idea.pluck(:published_at).compact),
        new_comments_increase: stat_increase(Comment.pluck(:created_at)),
        new_users_increase: stat_increase(User.pluck(:registration_completed_at).compact)
      }
    end

    def days_ago
      t1, t2 = ic_schedule.first 2
      t2 ||= t1 + 7.days
      ((t2 - t1) / 1.day).days
    end

    def stat_increase(stat_dates = [])
      stat_dates.count { |t| t > (Time.now - days_ago) }
    end

    def top_project_inputs
      @top_project_inputs ||= Project.where(id: top_project_ids).map do |project|
        phase = TimelineService.new.current_phase project
        {
          project: serialize_project(project),
          current_phase: phase ? serialize_phase(phase) : nil,
          top_ideas: top_ideas_grouped_by_project[project.id].map { |idea| serialize_input(idea) }
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
        idea.participation_method_on_creation.supports_public_visibility?
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

    def successful_proposals(time: Time.zone.today)
      @successful_proposals ||= Idea
        .published
        .with_status_code('threshold_reached')
        .with_status_transitioned_after(time - 1.week)
        .includes(:idea_images)
        .map { |idea| serialize_proposal(idea) }
    end

    def ideas_activity_counts(ideas)
      idea_ids = ideas.pluck(:id)
      new_reactions = Reaction.where(reactable_id: idea_ids).where('created_at > ?', Time.now - days_ago)
      new_likes_counts = new_reactions.where(mode: 'up').group(:reactable_id).count
      new_dislikes_counts = new_reactions.where(mode: 'down').group(:reactable_id).count
      new_comments_increases = Comment.where(idea_id: idea_ids).where('created_at > ?', Time.now - days_ago).group(:idea_id).count

      idea_ids.each_with_object({}) do |idea_id, object|
        likes = new_likes_counts[idea_id] || 0
        dislikes = new_dislikes_counts[idea_id] || 0
        comments        = new_comments_increases[idea_id] || 0
        total           = (likes + dislikes + comments)
        object[idea_id] = { likes: likes, dislikes: dislikes, comments: comments, total: total }
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
        end_at: phase.end_at&.iso8601
      }
    end

    def serialize_input(idea)
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(idea),
        published_at: idea.published_at.iso8601,
        author_name: idea.author_name,
        likes_count: idea.likes_count,
        likes_increment: idea_activity(idea, :likes),
        dislikes_count: idea.dislikes_count,
        dislikes_increment: idea_activity(idea, :dislikes),
        comments_count: idea.comments_count,
        comments_increment: idea_activity(idea, :comments)
      }
    end

    def serialize_proposal(proposal)
      {
        id: proposal.id,
        title_multiloc: proposal.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(proposal),
        published_at: proposal.published_at.iso8601,
        author_name: proposal.author_name,
        likes_count: proposal.likes_count,
        comments_count: proposal.comments_count
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
