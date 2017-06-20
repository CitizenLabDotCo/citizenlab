class Page < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  belongs_to :project, optional: true

  validates :title_multiloc, :body_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, presence: true, uniqueness: true, format: {with: SlugService.new.regex }

  before_validation :generate_slug, on: :create
  before_validation :sanitize_body_multiloc


  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, self.title_multiloc.values.first
  end

  def sanitize_body_multiloc
    self.body_multiloc = self.body_multiloc.map do |locale, body|
      [locale, @@sanitizer.sanitize(body)]
    end.to_h
  end

end
