# == Schema Information
#
# Table name: areas
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb
#  description_multiloc :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  ordering             :integer
#
class Area < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0
  default_scope -> { order(ordering: :asc) }

  has_many :areas_projects, dependent: :destroy
  has_many :projects, through: :areas_projects
  has_many :areas_ideas, dependent: :destroy
  has_many :ideas, through: :areas_ideas
  has_many :areas_initiatives, dependent: :destroy
  has_many :initiatives, through: :areas_initiatives

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  validates :ordering, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
  }, unless: ->(area) { area.ordering.nil? }

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
    self.description_multiloc = service.linkify_multiloc description_multiloc
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end
end
