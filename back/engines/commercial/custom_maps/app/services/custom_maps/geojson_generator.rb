module CustomMaps
  class GeojsonGenerator
    def initialize(phase, field, include_private_attributes)
      @phase = phase
      @field = field
      @include_private_attributes = include_private_attributes
      @inputs = phase.ideas.native_survey.published
      @participation_method = phase.pmethod
      @fields_in_form = IdeaCustomFieldsService.new(phase.custom_form).reportable_fields
      @multiloc_service = MultilocService.new(app_configuration: AppConfiguration.instance)
      @url_service = Frontend::UrlService.new
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
        accu[field.key] = CustomFieldForGeojson.new(field).value_from(input)
      end
    end
  end
end
