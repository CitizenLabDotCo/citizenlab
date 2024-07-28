# frozen_string_literal: true

module CustomMaps
  module Patches
    module IdeaCustomFields
      module WebApi
        module V1
          module Admin
            module IdeaCustomFieldsController
              def as_geojson
                set_custom_field
                raise_error_if_not_geographic_field

                phase = Phase.find(params[:phase_id])
                geojson = I18n.with_locale(current_user.locale) do
                  CustomMaps::GeojsonExport::GeojsonGenerator.new(phase, @custom_field).generate_geojson
                end

                send_data geojson, type: 'application/json', filename: 'my_survey.geojson'
              end

              def raise_error_if_not_geographic_field
                return if @custom_field.geographic_input?

                raise "Custom field with input_type: '#{@custom_field.input_type}' is not a geographic type"
              end

              def include_in_index_response
                %i[options options.image map_config]
              end

              def relate_map_config_to_field(field, field_params, errors, index)
                map_config_id = field_params[:map_config_id]
                return if map_config_id.blank?

                map_config = CustomMaps::MapConfig.find_by(id: map_config_id)
                # Add to `errors` if not found, to avoid a 404 which would interrupt the 422 `errors` response
                add_map_configs_errors(errors, index, ['map_config with an ID of map_config_id was not found']) unless map_config
                return unless map_config

                unless map_config.update(mappable_id: field.id, mappable_type: 'CustomField')
                  add_map_configs_errors(errors, index, map_config.errors)
                end
              end

              def add_map_configs_errors(errors, index, map_config_errors)
                errors[index.to_s] ||= {}
                errors[index.to_s][:map_config] ||= {}
                errors[index.to_s][:map_config] = map_config_errors
              end
            end
          end
        end
      end
    end
  end
end
