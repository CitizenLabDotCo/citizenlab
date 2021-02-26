class Idea < ApplicationRecord
  include MachineTranslations::IdeaDecorator
  include Post
  include Moderatable

  belongs_to :project, touch: true
  belongs_to :idea_status, optional: true

  counter_culture :idea_status, touch: true
  counter_culture :project,
    column_name: proc { |idea| idea.publication_status == 'published' ? "ideas_count" : nil },
    column_names: {
      ["ideas.publication_status = ?", 'published'] => 'ideas_count'
    },
    touch: true

  counter_culture :project,
    column_name: 'comments_count',
    delta_magnitude: proc { |idea| idea.comments_count }

  belongs_to :assignee, class_name: 'User', optional: true

  has_many :tagging_taggings
  has_many :tagging_tags, through: :tagging_taggings
  has_and_belongs_to_many :tagging_pending_tasks, class_name: 'Tagging::PendingTask', join_table: :tagging_pending_tasks_ideas 
  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas
  has_many :ideas_phases, dependent: :destroy
  has_many :phases, through: :ideas_phases
  has_many :baskets_ideas, dependent: :destroy
  has_many :baskets, through: :baskets_ideas
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  has_many :idea_images, -> { order(:ordering) }, dependent: :destroy
  has_many :idea_files, -> { order(:ordering) }, dependent: :destroy
  has_one :idea_trending_info

  validates_numericality_of :proposed_budget, greater_than_or_equal_to: 0, allow_nil: true
  with_options unless: :draft? do |idea|
    idea.validates :idea_status, presence: true
    idea.validates :project, presence: true
    idea.validate :assignee_can_moderate_project

    idea.before_validation :set_idea_status
    idea.before_validation :sanitize_body_multiloc, if: :body_multiloc
  end
  after_update :fix_comments_count_on_projects

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:ideas_topics)
    .where(ideas_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_some_topics, (Proc.new do |topic_ids|
    with_dups = joins(:ideas_topics).where(ideas_topics: {topic_id: topic_ids})
    # Removing duplicate results in this manner,
    # because .distinct gives SQL errors when
    # combined with other queries.
    where(id: with_dups)
  end)

  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_ideas)
    .where(areas_ideas: {area_id: uniq_area_ids})
    .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :with_some_areas, (Proc.new do |area_ids|
    with_dups = joins(:areas_ideas).where(areas_ideas: {area_id: area_ids})
    where(id: with_dups)
  end)

  scope :in_phase, (Proc.new do |phase_id|
    joins(:ideas_phases)
      .where(ideas_phases: {phase_id: phase_id})
  end)

  scope :with_project_publication_status, (Proc.new do |publication_status|
    joins(project: [:admin_publication])
      .where(projects: {admin_publications: {publication_status: publication_status}})
  end)

  scope :order_popular, -> (direction=:desc) {order(Arel.sql("(upvotes_count - downvotes_count) #{direction}, ideas.id"))}
  # based on https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d

  scope :order_status, -> (direction=:desc) {
    joins(:idea_status)
    .order("idea_statuses.ordering #{direction}, ideas.id")
  }

  scope :feedback_needed, -> {
    joins(:idea_status).where(idea_statuses: {code: 'proposed'})
      .where('ideas.id NOT IN (SELECT DISTINCT(post_id) FROM official_feedbacks)')
  }

  scope :order_with, lambda { |scope_name|
    case scope_name
    when 'random'   then order_random
    when 'trending' then order_trending
    when 'popular'  then order_popular
    when 'new'      then order_new
    when '-new'     then order_new(:asc)
    else order_trending
    end
  }

  scope :order_trending, -> { TrendingIdeaService.new.sort_trending(where('TRUE')) }

  private

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end

  def set_idea_status
    self.idea_status ||= IdeaStatus.find_by!(code: 'proposed')
  end

  def assignee_can_moderate_project
    if self.assignee && self.project &&
      !ProjectPolicy.new(self.assignee, self.project).moderate?
      self.errors.add(
        :assignee_id,
        :assignee_can_not_moderate_project,
        message: 'The assignee can not moderate the project of this idea'
      )
    end
  end

  def fix_comments_count_on_projects
    if project_id_previously_changed?
      Comment.counter_culture_fix_counts only: [[:idea, :project]]
    end
  end
end
