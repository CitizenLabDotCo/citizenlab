class Page < ApplicationRecord

  belongs_to :project, optional: true

  has_many :page_links, -> { order(:ordering) }, foreign_key: :linking_page_id, dependent: :destroy
  has_many :linked_pages, through: :page_links, source: :linked_page
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :page_files, -> { order(:ordering) }, dependent: :destroy

  PUBLICATION_STATUSES = %w(draft published)

  validates :title_multiloc, :body_multiloc, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}

  before_validation :generate_slug, on: :create
  before_validation :set_publication_status, on: :create
  before_validation :sanitize_body_multiloc
  before_validation :strip_title

  scope :published, -> {where publication_status: 'published'}
  scope :draft, -> {where publication_status: 'draft'}

  def published?
    publication_status == 'published'
  end

  private

  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, self.title_multiloc.values.first
  end

  def set_publication_status
    self.publication_status ||= 'published'
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

end
