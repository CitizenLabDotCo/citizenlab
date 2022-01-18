# == Schema Information
#
# Table name: maps_legend_items
#
#  id             :uuid             not null, primary key
#  map_config_id  :uuid             not null
#  title_multiloc :jsonb            not null
#  color          :string           not null
#  ordering       :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_maps_legend_items_on_map_config_id  (map_config_id)
#
# Foreign Keys
#
#  fk_rails_...  (map_config_id => maps_map_configs.id)
#
module CustomMaps
  class LegendItem < ApplicationRecord
    self.table_name = 'maps_legend_items'

    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:map_config_id]

    belongs_to :map_config, class_name: 'CustomMaps::MapConfig'

    validates :title_multiloc, presence: true, multiloc: {presence: true}
    validates :color, format: {with: /\A#[0-9a-f]{3}([0-9a-f]{3})?\z/}
  end
end
