module Analysis
  class HeatmapCellStatementGenerator
    def initialize
      @multiloc_service = MultilocService.new
    end

    def generate(cell)
      if cell.row.is_a?(::Analysis::Tag) && cell.column.is_a?(::CustomFieldBin)
        generate_tag_vs_bin(
          cell,
          tag: cell.row,
          bin: cell.column
        )
      elsif cell.row.is_a?(::CustomFieldBin) && cell.column.is_a?(::Analysis::Tag)
        generate_tag_vs_bin(
          cell,
          tag: cell.column,
          bin: cell.row
        )
      elsif cell.row.is_a?(::CustomFieldBin) && cell.column.is_a?(::CustomFieldBin)
        generate_bin_vs_bin(cell)
      else
        raise "Unsupported cell type for statement generation: #{cell.row_type} - #{cell.column_type}"
      end
    end

    private

    def generate_tag_vs_bin(cell, tag:, bin:)
      tag_name = tag.name

      @multiloc_service.block_to_multiloc do
        question = bin_to_question_str(bin)
        answer = bin_to_answer_str(bin)
        percent_more_less = lift_to_percentage_more_less_str(cell.lift)
        I18n.t(
          "analysis.cell_statement.tag_vs_bin.#{cell.unit}",
          answer:,
          question:,
          tag: "<span data-type=\"tag\" data-tag-id=\"#{tag.id}\">#{tag_name}</span>",
          percent_more_less:
        )
      end
    end

    def generate_bin_vs_bin(cell)
      @multiloc_service.block_to_multiloc do
        question1 = bin_to_question_str(cell.row)
        answer1 = bin_to_answer_str(cell.row)
        question2 = bin_to_question_str(cell.column)
        answer2 = bin_to_answer_str(cell.column)
        percent_more_less = lift_to_percentage_more_less_str(cell.lift)
        I18n.t(
          "analysis.cell_statement.bin_vs_bin.#{cell.unit}",
          answer1:,
          question1:,
          answer2:,
          question2:,
          percent_more_less:
        )
      end
    end

    def bin_to_question_str(bin)
      "<span data-type=\"question\" data-bin-id=\"#{bin.id}\">#{@multiloc_service.t(bin.custom_field.title_multiloc)}</span>"
    end

    def bin_to_answer_str(bin)
      answer = case bin
      when CustomFieldBins::OptionBin
        @multiloc_service.t(bin.custom_field_option.title_multiloc)
      when CustomFieldBins::ValueBin
        bin.values.join(', ')
      when CustomFieldBins::RangeBin, CustomFieldBins::AgeBin
        if bin.range.begin.nil?
          I18n.t('analysis.cell_statement.range_max', max: bin.range.end)
        elsif bin.range.end.nil?
          I18n.t('analysis.cell_statement.range_min', min: bin.range.begin)
        else
          I18n.t('analysis.cell_statement.range_min_max', min: bin.range.begin, max: bin.range.end)
        end
      else
        raise "Unsupported bin type for statement generation: #{bin.class}"
      end
      "<span data-type=\"answer\" data-bin-id=\"#{bin.id}\">#{answer}</span>"
    end

    def lift_to_percentage_more_less_str(lift)
      more_or_less = lift >= 1 ? 'more' : 'less'
      percent = decimal_to_percentage(lift)
      str = I18n.t("analysis.cell_statement.percent_#{more_or_less}", percent:)
      "<span data-type=\"percent\">#{str}</span>"
    end

    def decimal_to_percentage(decimal)
      ((decimal - 1) * 100).abs.round
    end
  end
end
