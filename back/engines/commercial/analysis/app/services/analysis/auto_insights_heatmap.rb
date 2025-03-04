require 'terminal-table'

module Analysis
  class AutoInsightsHeatmap
    def initialize(analysis)
      @analysis = analysis
      @multiloc_service = MultilocService.new
      @big_fat_matrix = AutoInsightsService.new(@analysis).big_fat_matrix
    end

    # Given 2 categories of columns, generate a heatmap. A category is an array of columns that are similar (e.g. all custom field options for the same custom field)
    def generate(category1, category2)
      matrix_to_heatmap(@big_fat_matrix, category1, category2)
    end

    def pretty_print_as_table(heatmap)
      category1 = heatmap.keys
      category2 = heatmap.values.flat_map(&:keys).uniq

      table = Terminal::Table.new do |t|
        t << ([''] + category2.map { |col| col_to_string(col) })
        category1.each do |col1|
          t << ([col_to_string(col1)] + category2.map { |col2| heatmap[col1][col2] })
        end
      end

      puts table
    end

    def col_to_string(col)
      col.try(:name) || col.try(:key)
    end

    def heatmap_to_liftmap(heatmap)
      new_heatmap = {}
      heatmap.each do |col1, row|
        new_heatmap[col1] = {}
        row.each do |col2, count|
          total_col1 = row.values.sum
          total_col2 = heatmap.values.map { |r| r[col2] }.sum
          total = heatmap.values.map { |r| r.values.sum }.sum
          expected = total_col1 * total_col2 / total.to_f
          lift = count / expected
          new_heatmap[col1][col2] = lift
        end
      end
      new_heatmap
    end

    def map_over(heatmap, &)
      new_heatmap = {}
      heatmap.each do |col1, row|
        new_heatmap[col1] = {}
        row.each do |col2, value|
          new_heatmap[col1][col2] = yield(col1, col2, value)
        end
      end
      new_heatmap
    end

    def association_to_sentence(association, heatmap, liftmap)
      col1, col2, _chi2, _p_value = association
      "People who #{col_to_action(col1)} #{col_to_action(col2)} #{decimal_to_percentage(liftmap[col1][col2].round(2))} than the average. (#{heatmap[col1][col2]} occurrences)"
    end

    def col_to_action(col)
      case col
      when CustomFieldOption
        "respond '#{@multiloc_service.t(col.title_multiloc)}' to '#{@multiloc_service.t(col.custom_field.title_multiloc)}'"
      when Tag
        "post in #{col.name}"
      end
    end

    # Example output
    # decimal_to_percentage(1.1) => '10% more'
    # decimal_to_percentage(0.9) => '10% less'
    # decimal_to_percentage(2.02) => '102% more'
    def decimal_to_percentage(decimal)
      percentage = (decimal - 1) * 100
      if percentage > 0
        "#{percentage.round(0)}% more"
      else
        "#{percentage.abs.round(0)}% less"
      end
    end

    private

    def matrix_to_heatmap(matrix, category1, category2, &)
      heatmap = {}
      matrix.each do |row|
        category1.each do |col1|
          category2.each do |col2|
            heatmap[col1] ||= {}
            heatmap[col1][col2] ||= 0
            heatmap[col1][col2] += 1 if row[col1] && row[col2]
          end
        end
      end
      heatmap
    end
  end
end
