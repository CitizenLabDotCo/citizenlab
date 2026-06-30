# frozen_string_literal: true

module Export
  module Pdf
    # The set of input fields included in the PDF export, in form order. Shared
    # between the generator and the fields endpoint so the review UI lists
    # exactly what the export will contain (including user/registration fields
    # appended to the form). `pmethod.custom_form` resolves the form from the
    # right context per method (the phase for surveys/proposals, the project for
    # ideation) and falls back to an unsaved form when none exists yet.
    class InputFields
      def initialize(phase)
        @custom_form = phase.pmethod.custom_form
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
