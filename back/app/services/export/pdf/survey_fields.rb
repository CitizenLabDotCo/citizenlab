# frozen_string_literal: true

module Export
  module Pdf
    # The set of survey fields included in the PDF export, in form order. Shared
    # between the generator and the fields endpoint so the review UI lists
    # exactly what the export will contain (including user/registration fields
    # appended to the form). `custom_form` is a lazily-created has_one, so we
    # fall back to an unsaved one (matching Surveys::ResultsGenerator).
    class SurveyFields
      def initialize(phase)
        @custom_form = phase.custom_form || CustomForm.new(participation_context: phase)
      end

      def fields
        @fields ||= IdeaCustomFieldsService
          .new(@custom_form)
          .xlsx_exportable_fields
          .reject { |field| field.input_type == 'page' }
      end
    end
  end
end
