# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class BaseFormExporter
    def initialize(phase, locale, _personal_data_enabled)
      @phase = phase
      @project = phase.project
      @locale = locale
      @participation_method = Factory.instance.participation_method_for(phase)
      @form_fields = IdeaCustomFieldsService.new(@participation_method.custom_form).importable_fields
    end

    def export
      raise NotImplementedError, 'This method is not yet implemented'
    end

    def mime_type
      raise NotImplementedError, 'This method is not yet implemented'
    end

    def filename
      raise NotImplementedError, 'This method is not yet implemented'
    end

    # Combines fields and options from the export into a single array for lookup on import
    def importer_data
      fields = @form_fields.map do |field|
        {
          name: field[:title_multiloc][@locale],
          type: 'field',
          input_type: field[:input_type],
          code: field[:code],
          key: field[:key],
          parent_key: nil,
          page: 1,
          position: nil
        }
      end
      options = @form_fields.map do |field|
        field.options.map do |option|
          {
            name: option[:title_multiloc][@locale],
            type: 'option',
            input_type: 'option',
            code: option[:code],
            key: option[:key],
            parent_key: field[:key],
            page: 1,
            position: nil
          }
        end
      end

      {
        page_count: 1,
        fields: fields + options.flatten
      }
    end
  end
end
