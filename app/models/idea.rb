class Idea < ApplicationRecord
  include PgSearch
  mount_uploaders :images, IdeaImageUploader
  mount_uploaders :files, IdeaFileUploader

  pg_search_scope :search_by_all, :against => [:title_multiloc, :body_multiloc, :author_name]

  belongs_to :project, optional: true
  belongs_to :author, class_name: 'User', optional: true
  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas
  has_many :comments, dependent: :destroy
  has_many :votes, as: :votable, dependent: :destroy
  has_many :upvotes, -> { where(mode: "up") }, as: :votable, class_name: 'Vote'
  has_many :downvotes, -> { where(mode: "down") }, as: :votable, class_name: 'Vote'

  PUBLICATION_STATUSES = %w(draft published closed spam)
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :body_multiloc, presence: true, multiloc: {presence: true}, unless: :draft?
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}
  validates :author, presence: true, unless: :draft?
  validates :author_name, presence: true, unless: :draft?

  before_validation :set_author_name, on: :create
  after_validation :set_published_at, if: ->(idea){ idea.published? && idea.publication_status_changed? }

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:ideas_topics)
    .where(ideas_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_ideas)
    .where(areas_ideas: {area_id: uniq_area_ids})
    .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :order_new, -> (direction=:desc) {order(published_at: direction)}
  scope :order_popular, -> (direction=:desc) {order("(upvotes_count - downvotes_count) #{direction}")}
  # based on https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
  scope :order_trending, (Proc.new do |direction|
    direction ||= :desc
    order(<<~EOS
      (
        (upvotes_count - downvotes_count)
        /
        power(ABS(EXTRACT(epoch FROM (NOW() - published_at))/3600) , 1.1)
      ) #{direction}
    EOS
    )
  end)

  scope :published, -> {where publication_status: 'published'}

  def draft?
    self.publication_status == 'draft'
  end

  def published?
    self.publication_status == 'published'
  end

  def score
    upvotes_count - downvotes_count
  end

  def trending_score
    score /
    ((Time.now - published_at).abs / 3600)**1.1
  end

  def set_author_name
    self.author_name = self.author.display_name if self.author
  end

  def set_published_at
    self.published_at ||= Time.now
  end
end
