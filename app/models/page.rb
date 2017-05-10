class Page < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  validates :title_multiloc, :body_multiloc, presence: true, multiloc: {presence: true}
  validates :slug, presence: true, uniqueness: true, format: {with: /\A[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*\z/ }

  before_validation :generate_slug
  before_validation :sanitize_body_multiloc


  def generate_slug
    unless self.slug
      slug = title_multiloc.values.first.parameterize
      indexedSlug = nil
      i=0
      while Page.find_by(slug: indexedSlug || slug)
        i +=1
        indexedSlug = [slug, '-', i].join
      end
      self.slug = indexedSlug || slug
    end
  end


  def sanitize_body_multiloc
    self.body_multiloc = self.body_multiloc.map do |locale, body|
      [locale, @@sanitizer.sanitize(body)]
    end.to_h
  end

end
