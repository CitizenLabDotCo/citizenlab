module CustomMaps
  class Layer < ApplicationRecord
    self.table_name = 'maps_layers'

    attribute :geojson_file

    GEOJSON_SCHEMA = CustomMaps::Engine.root.join('config','schemas','geojson.json_schema').to_s

    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:map_config_id]

    belongs_to :map_config, class_name: 'CustomMaps::MapConfig'

    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :default_enabled, inclusion: { in: [true, false] }
    validates :geojson, presence: true, json: { schema: GEOJSON_SCHEMA, message: ->(errors) { errors } }
    validates :marker_svg_url,
              format: { with: %r{\Ahttps://.*\z}, message: 'should start with https://' },
              allow_nil: true

    before_validation :set_default_enabled, :decode_geojson_file

    # If there's a geojson file being passed, but not geojson, read the file and set it as geojson.
    def decode_geojson_file
      return unless !(geojson_changed? && geojson) && geojson_file_changed? && geojson_file

      self.geojson = JSON.parse(Base64.decode64(geojson_file[:base64].gsub('data:application/json;base64,', '')))
    end

    def set_default_enabled
      return unless default_enabled.nil?

      self.default_enabled = true
    end
  end
end
