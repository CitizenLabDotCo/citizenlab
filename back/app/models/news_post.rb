# == Schema Information
#
# Table name: news_posts
#
#  id             :uuid             not null, primary key
#  title_multiloc :jsonb
#  body_multiloc  :jsonb
#  slug           :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class NewsPost < ApplicationRecord
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :body_multiloc, presence: true, multiloc: { presence: true }
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create
  before_validation :strip_title
  before_validation :sanitize_body_multiloc

  def generate_slug
    self.slug ||= SlugService.new.generate_slug self, title_multiloc.values.first
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      body_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags body_multiloc
    self.body_multiloc = service.linkify_multiloc body_multiloc
  end
end
