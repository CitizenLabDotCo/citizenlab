module Maps
  class Layer < ApplicationRecord
    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:map_config_id]

    belongs_to :map_config, class_name: 'Maps::MapConfig'
    has_many :legend_items, class_name: 'Maps::LegendItem', dependent: :destroy

    validates :title_multiloc, presence: true, multiloc: {presence: true}


  end
end