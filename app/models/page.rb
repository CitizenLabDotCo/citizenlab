class Page < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  belongs_to :project, optional: true

  has_many :page_links, -> { order(:ordering) }, foreign_key: :linking_page_id, dependent: :destroy
  has_many :linked_pages, through: :page_links, source: :linked_page

  validates :title_multiloc, :body_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, presence: true, uniqueness: true, format: {with: SlugService.new.regex }

  before_validation :generate_slug, on: :create


  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, self.title_multiloc.values.first
  end

end
