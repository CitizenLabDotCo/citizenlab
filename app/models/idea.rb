class Idea < ApplicationRecord
  include Post


  belongs_to :project, touch: true
  counter_culture :project, 
    column_name: proc {|idea| idea.publication_status == 'published' ? "ideas_count" : nil},
    column_names: {
      ["ideas.publication_status = ?", 'published'] => 'ideas_count'
    },
    touch: true
  counter_culture :project, 
    column_name: 'comments_count', 
    delta_magnitude: proc { |idea| idea.comments_count }

  belongs_to :assignee, class_name: 'User', optional: true

  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas
  has_many :ideas_phases, dependent: :destroy
  has_many :phases, through: :ideas_phases
  has_many :baskets_ideas, dependent: :destroy
  has_many :baskets, through: :baskets_ideas

  belongs_to :idea_status
  has_many :notifications, foreign_key: :idea_id, dependent: :nullify

  has_many :idea_images, -> { order(:ordering) }, dependent: :destroy
  has_many :idea_files, -> { order(:ordering) }, dependent: :destroy
  has_one :idea_trending_info

  validates :project, presence: true, unless: :draft?
  validates :idea_status, presence: true, unless: :draft?
  validate :assignee_can_moderate_project, unless: :draft?

  before_validation :set_idea_status, on: :create
  after_update :fix_comments_count_on_projects

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:ideas_topics)
    .where(ideas_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_some_topics, (Proc.new do |topic_ids|
    joins(:ideas_topics)
      .where(ideas_topics: {topic_id: topic_ids})
  end)

  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_ideas)
    .where(areas_ideas: {area_id: uniq_area_ids})
    .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :with_some_areas, (Proc.new do |area_ids|
    joins(:areas_ideas)
      .where(areas_ideas: {area_id: area_ids})
  end)

  scope :in_phase, (Proc.new do |phase_id|
    joins(:ideas_phases)
      .where(ideas_phases: {phase_id: phase_id})
  end)

  scope :with_project_publication_status, (Proc.new do |publication_status|
    joins(:project)
      .where(projects: {publication_status: publication_status})
  end)

  scope :order_popular, -> (direction=:desc) {order(Arel.sql("(upvotes_count - downvotes_count) #{direction}"))}
  # based on https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
  scope :order_status, -> (direction=:desc) {
    joins(:idea_status)
    .order("idea_statuses.ordering #{direction}")
  }
  scope :feedback_needed, -> {
    joins(:idea_status).where(idea_statuses: {code: 'proposed'})
      .where('ideas.id NOT IN (SELECT DISTINCT(post_id) FROM official_feedbacks)')
  }

  
  private

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
