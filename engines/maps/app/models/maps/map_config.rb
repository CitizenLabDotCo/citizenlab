module Maps
  class MapConfig < ApplicationRecord
    belongs_to :project
    has_many :layers, class_name: 'Maps::Layer', dependent: :destroy

    validates :zoom_level, numericality: {greater_than_or_equal_to: 0, less_than_or_equal_to: 20}, allow_nil: true
    validates :tile_provider, format: {with: /\Ahttps:\/\/.+\z/}, allow_nil: true
  end
end
