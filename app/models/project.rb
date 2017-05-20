class Project < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  mount_uploader :images, ProjectImageUploader
  # mount_uploader :files, ProjectFileUploader

  has_many :projects_topics, dependent: :destroy
  has_many :topics, through: :projects_topics
  has_many :areas_projects, dependent: :destroy
  has_many :areas, through: :areas_projects
  has_many :phases, dependent: :destroy
  has_many :events, dependent: :destroy

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :slug, presence: true, uniqueness: true, format: {with: SlugService.new.regex }

  before_validation :generate_slug, on: :create
  before_validation :sanitize_description_multiloc

  private

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, self.title_multiloc.values.first
  end

  def sanitize_description_multiloc
    self.description_multiloc = self.description_multiloc.map do |locale, description|
      [locale, @@sanitizer.sanitize(description, tags: %w(p b u i strong a), attributes: %w(href))]
    end.to_h
  end
end
