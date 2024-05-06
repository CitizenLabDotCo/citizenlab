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
      raise NotImplementedError, 'This method is not yet implemented'
    end
  end
end
