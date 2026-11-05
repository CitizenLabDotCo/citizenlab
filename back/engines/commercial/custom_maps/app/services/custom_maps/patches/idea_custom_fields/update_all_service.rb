# frozen_string_literal: true

module CustomMaps
  module Patches
    module IdeaCustomFields
      module UpdateAllService
        def relate_map_config_to_field(field, field_params, index)
          map_config_id = field_params[:map_config_id]
          return if map_config_id.blank?

          map_config = CustomMaps::MapConfig.find_by(id: map_config_id)
          unless map_config
            add_map_configs_errors(index, ['map_config with an ID of map_config_id was not found'])
            return
          end

          return if map_config.update(mappable_id: field.id, mappable_type: 'CustomField')

          add_map_configs_errors(index, map_config.errors)
        end

        def add_map_configs_errors(index, map_config_errors)
          @errors[index.to_s] ||= {}
          @errors[index.to_s][:map_config] ||= {}
          @errors[index.to_s][:map_config] = map_config_errors
        end
      end
    end
  end
end
