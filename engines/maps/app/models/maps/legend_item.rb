module Maps
  class LegendItem < ApplicationRecord
    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:layer_id]

    belongs_to :layer, class_name: 'Maps::Layer'

    validates :title_multiloc, presence: true, multiloc: {presence: true}
    validates :color, format: {with: /\A#[0-9a-f]{3}([0-9a-f]{3})?\z/}, allow_nil: true
  end
end