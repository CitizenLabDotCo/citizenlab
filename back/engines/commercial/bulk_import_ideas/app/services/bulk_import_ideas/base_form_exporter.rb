# frozen_string_literal: true

module BulkImportIdeas
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

    # NOTE: This looks odd as it just replicates what the pdf_form_exporter needs to return
    def importer_data
      {
        page_count: 1,
        fields: @form_fields.map do |field, index|
          {
            name: field[:title_multiloc][@locale],
            type: 'field',
            input_type: field[:input_type],
            code: field[:code],
            key: field[:key],
            parent_key: nil,
            page: 1,
            position: index
          }
        end
      }
    end
  end
end
