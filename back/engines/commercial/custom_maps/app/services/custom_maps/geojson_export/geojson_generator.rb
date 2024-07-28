module CustomMaps
  module GeojsonExport
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
        properties = {
          translation_for('input_id') => input.id,
          translation_for('published_at') => input.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s
        }

        properties.merge!(generate_answers_to_questions(input))
        properties[translation_for('user_data')] = generate_user_data(input)

        properties
      end

      def generate_answers_to_questions(input)
        @fields_in_form.each_with_object({}) do |field, accu|
          accu[@field_ids_to_titles[field.id]] = CustomFieldForGeojson.new(field).value_from(input)
        end
      end

      def generate_user_data(input)
        return nil if input&.author.nil?

        basic_author_data(input).merge(user_custom_field_values_data(input))
      end

      def basic_author_data(input)
        {
          translation_for('author_id') => input&.author&.id,
          translation_for('author_email') => input&.author&.email,
          translation_for('author_fullname') => input&.author_name
        }
      end

      def user_custom_field_values_data(input)
        registration_fields.each_with_object({}) do |field, accu|
          accu[@multiloc_service.t(field.title_multiloc)] = if field.code == 'domicile'
            DomicileFieldForGeojson.new(field, :author).value_from(input)
          else
            CustomFieldForGeojson.new(field, :author).value_from(input)
          end
        end
      end

      def set_non_colliding_titles
        field_ids_to_titles = @fields_in_form.to_h { |field| [field.id, @multiloc_service.t(field.title_multiloc)] }
        colliding = field_ids_to_titles.values.group_by(&:itself).select { |_id, title| title.size > 1 }.map(&:first)

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

      def translation_for(key)
        I18n.t key, scope: 'xlsx_export.column_headers'
      end

      def registration_fields
        @registration_fields ||= CustomField.registration.includes(:options).order(:ordering).all
      end
    end
  end
end
