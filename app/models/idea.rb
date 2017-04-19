class Idea < ApplicationRecord
  mount_uploaders :images, IdeaImageUploader
  mount_uploaders :files, IdeaFileUploader

  belongs_to :lab, optional: true
  belongs_to :author, class_name: 'User', optional: true
  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas
  has_many :comments, dependent: :destroy
  has_many :votes, as: :votable, dependent: :destroy

  PUBLICATION_STATUSES = %w(draft published closed spam)
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :body_multiloc, presence: true, multiloc: {presence: true}, unless: :draft?
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}
  validates :author, presence: true, unless: :draft?
  validates :author_name, presence: true, unless: :draft?

  before_validation :set_author_name, on: :create

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

  def draft?
    self.publication_status == 'draft'
  end

  def set_author_name
    self.author_name = self.author.display_name if self.author
  end
end
