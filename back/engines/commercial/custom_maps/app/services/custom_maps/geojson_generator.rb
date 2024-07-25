module CustomMaps
  class GeojsonGenerator
    def initialize(phase, field)
      @phase = phase
      @field = field
      @inputs = phase.ideas.native_survey.published
      @fields_in_form = IdeaCustomFieldsService.new(phase.custom_form).reportable_fields
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
      @field_ids_to_titles = set_non_colliding_titles
    end

    def generate_geojson
      geojson_hash = { type: 'FeatureCollection', features: [] }

      @inputs.each do |input|
        geojson_hash[:features] << {
          type: 'Feature', geometry: input.custom_field_values[@field.key], properties: generate_properties(input)
        }
      end

      geojson_hash.to_json
    end

    private

    def generate_properties(input)
      @fields_in_form.each_with_object({}) do |field, accu|
        field_for_geojson = CustomFieldForGeojson.new(field)

        accu[@field_ids_to_titles[field.id]] = field_for_geojson.value_from(input)
      end
    end

    def set_non_colliding_titles
      field_ids_to_titles = map_field_ids_to_titles

      colliding = field_ids_to_titles.values.group_by(&:itself).select { |_k, v| v.size > 1 }.map(&:first)

      colliding.each do |colliding_title|
        n = 1

        field_ids_to_titles.each do |field_id, field_title|
          next unless colliding_title == field_title

          field_ids_to_titles[field_id] = "#{field_title} (#{n})"
          n += 1
        end
      end

      field_ids_to_titles
    end

    def map_field_ids_to_titles
      @fields_in_form.each_with_object({}) do |field, accu|
        accu[field.id] = @multiloc_service.t(field.title_multiloc)
      end
    end
  end
end
