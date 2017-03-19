class Idea < ApplicationRecord
  mount_uploader :images, IdeaImageUploader
  mount_uploader :files, IdeaFileUploader

  belongs_to :lab
  belongs_to :author, class_name: 'User'
  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas

  PUBLICATION_STATUSES = %w(draft published closed spam)
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :body_multiloc, presence: true, multiloc: {presence: false}, unless: :draft?
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}
  validates :lab, presence: true
  validates :author, presence: true, unless: :draft?
  validates :author_name, presence: true, unless: :draft?

  before_validation :set_author_name, on: :create

  def draft?
    self.publication_status == 'draft'
  end

  def set_author_name
    self.author_name = self.author.name if self.author
  end
end
