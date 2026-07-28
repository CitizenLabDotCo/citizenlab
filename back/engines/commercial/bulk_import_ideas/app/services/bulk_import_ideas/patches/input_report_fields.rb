# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module InputReportFields
      private

      def meta_report_fields
        super + [imported_report_field]
      end

      def imported_report_field
        Export::ComputedFieldForReport.new(
          column_header_for('imported'),
          ->(input) { input.idea_import ? 'true' : 'false' },
          key: 'imported'
        )
      end
    end
  end
end
