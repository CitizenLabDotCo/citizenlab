module Analysis
  class HeatmapCellStatementGenerator
    def initialize
      @multiloc_service = MultilocService.new
    end

    def generate(cell)
      row_type = cell.row.class
      column_type = cell.column.class

      if [row_type, column_type].to_set == [CustomFieldOption, Tag].to_set
        generate_tag_custom_field(cell)
      elsif [row_type, column_type].to_set == [CustomFieldOption].to_set
        generate_custom_field_custom_field(cell)
      else
        raise "Unsupported cell type combination: #{row_type}, #{column_type}"
      end
    end

    private

    def generate_tag_custom_field(cell)
      custom_field_option = cell.column if cell.column.is_a?(CustomFieldOption)
      custom_field_option = cell.row if cell.row.is_a?(CustomFieldOption)
      tag = cell.column if cell.column.is_a?(Tag)
      tag = cell.row if cell.row.is_a?(Tag)

      answer = @multiloc_service.t(custom_field_option.title_multiloc)
      question = @multiloc_service.t(custom_field_option.custom_field.title_multiloc)
      percent_copy = cell.lift >= 1 ? 'percent_more' : 'percent_less'

      @multiloc_service.i18n_to_multiloc("analysis.cell_statement.tag_custom_field.#{cell.unit}",
        answer:, question:, tag: tag.name,
        percent_more_less: I18n.t("analysis.cell_statement.tag_custom_field.#{percent_copy}", percent: decimal_to_percentage(cell.lift)))
    end

    def generate_custom_field_custom_field(cell)
      question1 = @multiloc_service.t(cell.row.custom_field.title_multiloc)
      question2 = @multiloc_service.t(cell.column.custom_field.title_multiloc)
      answer1 = @multiloc_service.t(cell.row.title_multiloc)
      answer2 = @multiloc_service.t(cell.column.title_multiloc)
      percent_copy = cell.lift >= 1 ? 'percent_more' : 'percent_less'

      @multiloc_service.i18n_to_multiloc("analysis.cell_statement.custom_field_custom_field.#{cell.unit}",
        answer1:, answer2:, question1:, question2:,
        percent_more_less: I18n.t("analysis.cell_statement.custom_field_custom_field.#{percent_copy}", percent: decimal_to_percentage(cell.lift)))
    end

    def decimal_to_percentage(decimal)
      ((decimal - 1) * 100).abs.round
    end
  end
end
