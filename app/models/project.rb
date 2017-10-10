class Project < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  mount_base64_uploader :header_bg, HeaderBgUploader


  has_many :projects_topics, dependent: :destroy
  has_many :topics, through: :projects_topics
  has_many :areas_projects, dependent: :destroy
  has_many :areas, through: :areas_projects
  has_many :phases, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :pages, dependent: :destroy
  has_many :project_images, dependent: :destroy


  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :slug, presence: true, uniqueness: true, format: {with: SlugService.new.regex }

  before_validation :generate_slug, on: :create
  before_validation :sanitize_description_multiloc, if: :description_multiloc


  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_projects)
    .where(areas_projects: {area_id: uniq_area_ids})
    .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:projects_topics)
    .where(projects_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

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
