# == Schema Information
#
# Table name: ideas
#
#  id                       :uuid             not null, primary key
#  title_multiloc           :jsonb
#  body_multiloc            :jsonb
#  publication_status       :string
#  published_at             :datetime
#  project_id               :uuid
#  author_id                :uuid
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  upvotes_count            :integer          default(0), not null
#  downvotes_count          :integer          default(0), not null
#  location_point           :geography        point, 4326
#  location_description     :string
#  comments_count           :integer          default(0), not null
#  idea_status_id           :uuid
#  slug                     :string
#  budget                   :integer
#  baskets_count            :integer          default(0), not null
#  official_feedbacks_count :integer          default(0), not null
#  assignee_id              :uuid
#  assigned_at              :datetime
#  proposed_budget          :integer
#
# Indexes
#
#  index_ideas_on_author_id       (author_id)
#  index_ideas_on_idea_status_id  (idea_status_id)
#  index_ideas_on_location_point  (location_point) USING gist
#  index_ideas_on_project_id      (project_id)
#  index_ideas_on_slug            (slug) UNIQUE
#  index_ideas_search             (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))) USING gin
#
# Foreign Keys
#
#  fk_rails_...  (assignee_id => users.id)
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (idea_status_id => idea_statuses.id)
#  fk_rails_...  (project_id => projects.id)
#
class Idea < ApplicationRecord
  include Post
  extend OrderAsSpecified

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

  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas
  has_many :ideas_phases, dependent: :destroy
  has_many :phases, through: :ideas_phases, after_add: :update_phase_ideas_count, after_remove: :update_phase_ideas_count
  has_many :baskets_ideas, dependent: :destroy
  has_many :baskets, through: :baskets_ideas
  has_many :text_images, as: :imageable, dependent: :destroy

  has_many :idea_images, -> { order(:ordering) }, dependent: :destroy, inverse_of: :idea
  has_many :idea_files, -> { order(:ordering) }, dependent: :destroy, inverse_of: :idea
  has_one :idea_trending_info

  accepts_nested_attributes_for :text_images, :idea_images, :idea_files

  validates_numericality_of :proposed_budget, greater_than_or_equal_to: 0, if: :proposed_budget

  with_options unless: :draft? do
    validates :idea_status, presence: true
    validates :project, presence: true
    before_validation :set_idea_status
    before_validation :sanitize_body_multiloc, if: :body_multiloc
  end

  after_update :fix_comments_count_on_projects

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:ideas_topics)
    .where(ideas_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_some_topics, (Proc.new do |topics|
    ideas = joins(:ideas_topics).where(ideas_topics: {topic: topics})
    where(id: ideas)
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

  def just_published?
    publication_status_previous_change == %w[draft published] || publication_status_previous_change == [nil, 'published']
  end

  def will_be_published?
    publication_status_change == %w[draft published] || publication_status_change == [nil, 'published']
  end

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

  def fix_comments_count_on_projects
    if project_id_previously_changed?
      Comment.counter_culture_fix_counts only: [[:idea, :project]]
    end
  end

  def update_phase_ideas_count(_)
    IdeasPhase.counter_culture_fix_counts only: %i[phase]
  end
end

Idea.include_if_ee 'FlagInappropriateContent::Concerns::Flaggable'
Idea.include_if_ee 'Insights::Concerns::Input'
Idea.include_if_ee 'Moderation::Concerns::Moderatable'
Idea.include_if_ee 'MachineTranslations::Concerns::Translatable'
Idea.include_if_ee 'IdeaAssignment::Extensions::Idea'
