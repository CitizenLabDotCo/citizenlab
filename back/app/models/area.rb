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
#  geometry             :geography        geometry, 4326
#
# Indexes
#
#  index_areas_on_geometry  (geometry) USING gist
#
class Area < ApplicationRecord
  class << self
    def geometry_schema
      @geometry_schema ||= JSON.parse(File.read(Rails.root.join('config/schemas/geojson_polygon.json_schema')))
    end
  end

  acts_as_list column: :ordering, top_of_list: 0
  default_scope -> { order(ordering: :asc) }

  has_many :areas_projects, dependent: :destroy
  has_many :projects, through: :areas_projects
  has_many :areas_ideas, dependent: :destroy
  has_many :ideas, through: :areas_ideas
  has_many :areas_initiatives, dependent: :destroy
  has_many :initiatives, through: :areas_initiatives

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}

  before_validation :sanitize_description_multiloc
  before_validation :strip_title

  validates :geometry_geojson, json: { schema: -> { Area.geometry_schema }, message: ->(errors) { errors } }, allow_nil: true

  validates :ordering, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
  }, unless: ->(area) { area.ordering.nil? }

  def geometry_geojson
    RGeo::GeoJSON.encode(geometry) if geometry.present?
  end

  def geometry_geojson=(geojson)
    self.geometry = RGeo::GeoJSON.decode(geojson)
  end

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      self.description_multiloc,
      %i{title alignment list decoration link image video}
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_multiloc)
    self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

end
