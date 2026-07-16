module Export
  module Xlsx
    # Writes one worksheet of input responses: a header row plus one row per
    # input. Column assembly is shared with the pdf export and lives in
    # Export::InputReportFields; this class only handles the xlsx concerns
    # (styles, formula escaping, hyperlinks).
    class InputSheetGenerator
      US_DATE_TIME_FORMAT = 'mm/dd/yyyy hh:mm:ss'

      def initialize(inputs, phase, redacted_field_keys: [])
        @inputs = inputs
        @report_fields = Export::InputReportFields.new(phase, redacted_field_keys: redacted_field_keys)
      end

      def generate_sheet(workbook, sheetname)
        sheetname = utils.sanitize_sheetname sheetname
        workbook.styles do |styles|
          column_header = styles.add_style(
            b: true,
            alignment: { horizontal: :center, vertical: :top, wrap_text: true }
          )
          date_time = styles.add_style(format_code: US_DATE_TIME_FORMAT)
          workbook.add_worksheet(name: sheetname) do |sheet|
            sheet.add_row all_column_headers, style: column_header
            inputs.each do |input|
              values = all_report_field_values_for(input)
              styles = values.map do |value|
                value.is_a?(ActiveSupport::TimeWithZone) ? date_time : nil
              end

              sheet.add_row(values, style: styles)
            end
            hyperlink_indexes = all_report_fields.each_index.select do |idx|
              all_report_fields[idx].hyperlink?
            end
            utils.add_hyperlinks sheet, hyperlink_indexes
          end
        end
      end

      private

      attr_reader :inputs

      def all_report_fields
        @all_report_fields ||= @report_fields.all
      end

      def all_column_headers
        all_report_fields.map(&:column_header)
      end

      def all_report_field_values_for(input)
        all_report_fields.map do |field|
          utils.escape_formula field.value_from(input)
        end
      end

      def utils
        @utils ||= Utils.new
      end
    end
  end
end
