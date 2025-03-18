module Export
  module Geojson
    # This class is responsible for generating a GeoJSON representation of the answers to a survey mapping question.
    # It generates a GeoJSON FeatureCollection, with a Feature for each response to the question.
    # Each Feature has a geometry attribute, with its value representing the response,
    # Each Feature also has a properties attribute, with a value that includes all the answers to the survey questions
    # for the respective survey submission, along with selected user (input.author) data.
    class GeojsonGenerator
      def initialize(phase, field)
        @phase = phase
        @field = field
        @inputs = phase.ideas.native_survey.published
        @fields_in_form = IdeaCustomFieldsService.new(phase.custom_form).geojson_supported_fields
        @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
        @value_visitor = Geojson::ValueVisitor
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

      def filename
        "#{@multiloc_service.t(@phase.title_multiloc).tr(' ', '_')}_#{Time.now.strftime('%Y-%m-%d')}.geojson"
      end

      private

      def generate_properties(input)
        properties = {
          sanitized_translation_for('input_id') => input.id,
          sanitized_translation_for('published_at') => input.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s
        }

        properties.merge!(generate_answers_to_questions(input))
        properties.merge!(generate_user_data(input))

        properties
      end

      def generate_answers_to_questions(input)
        field_ids_to_titles = set_non_colliding_titles

        @fields_in_form.each_with_object({}) do |field, accu|
          accu[field_ids_to_titles[field.id]] = Export::CustomFieldForExport.new(field, @value_visitor).value_from(input)
        end
      end

      def generate_user_data(input)
        return {} if input&.author.nil?

        user_data_key = sanitized_translation_for('user_data')
        basic_author_data(input, user_data_key).merge(user_custom_field_values_data(input, user_data_key))
      end

      def basic_author_data(input, user_data_key)
        {
          "#{user_data_key}__#{sanitized_translation_for('author_id')}" => input&.author&.id,
          "#{user_data_key}__#{sanitized_translation_for('author_email')}" => input&.author&.email,
          "#{user_data_key}__#{sanitized_translation_for('author_fullname')}" => input&.author_name
        }
      end

      def user_custom_field_values_data(input, user_data_key)
        registration_fields.each_with_object({}) do |field, accu|
          key = "#{user_data_key}__#{sanitize_key(@multiloc_service.t(field.title_multiloc))}"
          accu[key] = Export::CustomFieldForExport.new(field, @value_visitor, :author).value_from(input)
        end
      end

      def set_non_colliding_titles
        field_ids_to_titles = @fields_in_form.to_h do |field|
          [field.id, sanitize_key(@multiloc_service.t(field.title_multiloc))]
        end

        colliding = field_ids_to_titles.values.group_by(&:itself).select { |_id, title| title.size > 1 }.map(&:first)

        colliding.each do |colliding_title|
          n = 1

          field_ids_to_titles.each do |field_id, field_title|
            next unless colliding_title == field_title

            field_ids_to_titles[field_id] = "#{field_title}_#{n}"
            n += 1
          end
        end

        field_ids_to_titles
      end

      def sanitized_translation_for(key)
        sanitize_key(translation_for(key))
      end

      def translation_for(key)
        I18n.t key, scope: 'xlsx_export.column_headers'
      end

      def sanitize_key(key)
        key.gsub(/[^0-9a-z -]/i, '').tr(' -', '_').downcase
      end

      def registration_fields
        @registration_fields ||= CustomField.registration.includes(:options).order(:ordering).all
      end
    end
  end
end
