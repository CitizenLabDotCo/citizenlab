module Analysis
  class HeatmapGenerator
    class HeatmapCell
      attr_accessor :count, :lift, :chi_square, :p_value

      def initialize
        @count = 0
      end
    end

    def initialize(analysis)
      @analysis = analysis
      @row_totals = {}
      @col_totals = {}
    end

    def generate(category1, category2)
      heatmap = generate_countmap(category1, category2)
      add_lift!(heatmap)
      add_significance!(heatmap)
      heatmap
    end

    private

    def generate_countmap(category1, category2)
      output = {}

      all_inputs.each do |input|
        category1.map do |col1|
          category2.map do |col2|
            output[[col1, col2]] ||= HeatmapCell.new
            if column_set_for_input?(input, col1) && column_set_for_input?(input, col2)
              output[[col1, col2]].count += 1
            end
          end
        end
      end

      output
    end

    def add_lift!(heatmap)
      total_inputs = calc_heatmap_sum(heatmap)
      heatmap.each do |(col1, col2), cell|
        cell.lift = if cell.count == 0
          0
        else
          expected = row_total(heatmap, col1) * col_total(heatmap, col2) / total_inputs.to_f
          cell.count / expected
        end
      end
    end

    def add_significance!(heatmap)
      total_inputs = calc_heatmap_sum(heatmap)
      heatmap.each do |(col1, col2), cell|
        contingency_table = generate_contingency_table(heatmap, col1, col2, total_inputs)
        cell.chi_square, cell.p_value = chi_square(contingency_table)
      end
    end

    def generate_contingency_table(heatmap, col1, col2, total_inputs)
      table = Hash.new(0)

      [true, false].product([true, false]) do |v1, v2|
        table[[v1, v2]] = 0
      end

      all_inputs.each do |input|
        in_col1 = column_set_for_input?(input, col1)
        in_col2 = column_set_for_input?(input, col2)
        table[[in_col1, in_col2]] += 1
      end

      table
    end

    def all_inputs
      @all_inputs ||= @analysis.inputs
        .includes(:author, :taggings)
        .select(:id, :custom_field_values, :author_id)
    end

    def row_total(heatmap, row)
      @row_totals[row] ||= heatmap.select { |(c1, _), _| c1 == row }.values.sum(&:count)
    end

    def col_total(heatmap, col)
      @col_totals[col] ||= heatmap.select { |(_, c2), _| c2 == col }.values.sum(&:count)
    end

    def calc_heatmap_sum(heatmap)
      heatmap.values.sum(&:count)
    end

    def column_set_for_input?(input, col)
      case col
      when Tag
        input.taggings.any? { |tagging| tagging.tag_id == col.id }
      when CustomFieldOption
        custom_field_value = if col.custom_field.custom_form_type?
          input.custom_field_values[col.custom_field.key]
        else
          input.author&.custom_field_values&.[](col.custom_field.key)
        end
        custom_field_value && (custom_field_value == col.key || custom_field_value.include?(col.key))
      else
        raise 'Invalid column type'
      end
    end

    def chi_square(table)
      # Sum over rows and columns
      row_sums = table.keys.group_by { |k| k[0] }.transform_values { |v| v.sum { |key| table[key] } }
      col_sums = table.keys.group_by { |k| k[1] }.transform_values { |v| v.sum { |key| table[key] } }
      total = table.values.sum

      chi2 = 0.0
      table.each do |(row, col), observed|
        expected = (row_sums[row] * col_sums[col]) / total.to_f

        # chi-square is not reliable if any of the expected frequencies are less
        # than 5 for a 2x2 contingency table
        if row_sums.size == 2 && col_sums.size == 2 && expected < 5
          return [0, 1]
        end

        chi2 += expected > 0 ? ((observed - expected)**2) / expected : 0
      end

      dof = (row_sums.size - 1) * (col_sums.size - 1)
      p_value = 1 - Distribution::ChiSquare.cdf(chi2, dof)
      [chi2, p_value]
    end
  end
end
