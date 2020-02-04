class ProjectFolder < ApplicationRecord

  has_many :projects, dependent: :nullify, foreign_key: :folder_id
  has_many :project_holder_orderings, as: :project_holder, dependent: :destroy

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, uniqueness: true, format: {with: SlugService.new.regex }

  before_validation :generate_slug, on: :create
  before_validation :sanitize_description_multiloc, if: :description_multiloc
  before_validation :sanitize_description_preview_multiloc, if: :description_preview_multiloc
  before_validation :strip_title


  private

  def generate_slug
    slug_service = SlugService.new
    self.slug ||= slug_service.generate_slug self, self.title_multiloc.values.first
  end

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.description_multiloc = service.remove_empty_paragraphs_multiloc(self.description_multiloc)
    self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
  end

  def sanitize_description_preview_multiloc
    service = SanitizationService.new
    self.description_preview_multiloc = service.sanitize_multiloc(
      self.description_preview_multiloc,
      %i{decoration link}
    )
    self.description_preview_multiloc = service.remove_empty_paragraphs_multiloc(self.description_preview_multiloc)
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
end
