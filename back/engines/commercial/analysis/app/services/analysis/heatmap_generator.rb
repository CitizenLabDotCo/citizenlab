module Analysis
  class HeatmapGenerator
    def initialize(analysis)
      @analysis = analysis
      @row_totals = {}
      @col_totals = {}
    end

    def generate(category1, category2, unit: 'inputs')
      heatmap = generate_countmap(category1, category2, unit)
      add_lift!(heatmap)
      add_significance!(heatmap, unit)
      heatmap.values.map(&:save!)
      heatmap
    end

    private

    def generate_countmap(category1, category2, unit)
      puts "Generating countmap for #{unit} with categories #{category1} and #{category2}"
      case unit
      when 'inputs'
        generate_countmap_for_inputs(category1, category2)
      when 'likes'
        generate_countmap_for_reactions(category1, category2, 'up')
      when 'dislikes'
        generate_countmap_for_reactions(category1, category2, 'down')
      when 'participants'
        generate_countmap_for_participants(category1, category2)
      else
        raise 'Invalid unit'
      end
    end

    def generate_countmap_for_inputs(category1, category2)
      output = {}

      all_inputs.each do |input|
        category1.map do |col1|
          category2.map do |col2|
            output[[col1, col2]] ||= HeatmapCell.new(row: col1, column: col2, analysis: @analysis, unit: 'inputs')
            if column_set_for_input?(input, col1) && column_set_for_input?(input, col2)
              output[[col1, col2]].count += 1
            end
          end
        end
      end

      output
    end

    def generate_countmap_for_reactions(category1, category2, mode)
      output = {}

      Reaction.where(reactable_type: 'Idea', reactable_id: all_inputs, mode:).includes(:user, :reactable).each do |reaction|
        category1.map do |col1|
          category2.map do |col2|
            output[[col1, col2]] ||= HeatmapCell.new(row: col1, column: col2, analysis: @analysis, unit: mode == 'up' ? 'likes' : 'dislikes')
            if column_set_for_reaction?(reaction, col1) && column_set_for_reaction?(reaction, col2)
              output[[col1, col2]].count += 1
            end
          end
        end
      end
      output
    end

    def generate_countmap_for_participants(category1, category2)
      output = {}

      participant_to_inputs_map.each do |participant, inputs|
        category1.map do |col1|
          category2.map do |col2|
            output[[col1, col2]] ||= HeatmapCell.new(row: col1, column: col2, analysis: @analysis, unit: 'participants')
            if inputs.any? { |input| column_set_for_participant?(input, participant, col1) && column_set_for_participant?(input, participant, col2) }
              output[[col1, col2]].count += 1
            end
          end
        end
      end

      output
    end

    def add_lift!(heatmap)
      heatmap_sum = calc_heatmap_sum(heatmap)
      heatmap.each do |(col1, col2), cell|
        cell.lift = if cell.count == 0
          0
        else
          expected = row_total(heatmap, col1) * col_total(heatmap, col2) / heatmap_sum.to_f
          cell.count / expected
        end
      end
    end

    def add_significance!(heatmap, unit)
      heatmap.each do |(col1, col2), cell|
        contingency_table = generate_contingency_table(col1, col2, unit)
        _, cell.p_value = chi_square(contingency_table)
      end
    end

    def generate_contingency_table(col1, col2, unit)
      table = Hash.new(0)

      [true, false].product([true, false]) do |v1, v2|
        table[[v1, v2]] = 0
      end

      case unit
      when 'inputs'
        all_inputs.each do |input|
          in_col1 = column_set_for_input?(input, col1)
          in_col2 = column_set_for_input?(input, col2)
          table[[in_col1, in_col2]] += 1
        end
      when 'likes', 'dislikes'
        mode = unit == 'likes' ? 'up' : 'down'
        Reaction.where(reactable_type: 'Idea', reactable_id: all_inputs, mode:).includes(:user, :reactable).each do |reaction|
          in_col1 = column_set_for_reaction?(reaction, col1)
          in_col2 = column_set_for_reaction?(reaction, col2)
          table[[in_col1, in_col2]] += 1
        end
      when 'participants'
        participant_to_inputs_map.each do |participant, inputs|
          inputs.each do |input|
            in_col1 = column_set_for_participant?(input, participant, col1)
            in_col2 = column_set_for_participant?(input, participant, col2)
            table[[in_col1, in_col2]] += 1
          end
        end
      else
        raise "Invalid unit #{unit}"
      end

      table
    end

    def all_inputs
      @all_inputs ||= @analysis.inputs
        .select(:id, :custom_field_values, :author_id)
        .includes(:author, :taggings)
        .to_a
    end

    def row_total(heatmap, row)
      @row_totals[heatmap] ||= {}
      @row_totals[heatmap][row] ||= heatmap.select { |(c1, _), _| c1 == row }.values.sum(&:count)
    end

    def col_total(heatmap, col)
      @col_totals[heatmap] ||= {}
      @col_totals[heatmap][col] ||= heatmap.select { |(_, c2), _| c2 == col }.values.sum(&:count)
    end

    def calc_heatmap_sum(heatmap)
      heatmap.values.sum(&:count)
    end

    def column_set_for_input?(input, col)
      case col
      when Tag
        tag_map[input.id]&.include?(col.id)
      when CustomFieldOption
        custom_field_value = if col.custom_field.custom_form_type?
          input.custom_field_values[col.custom_field.key]
        else
          input.author&.custom_field_values&.[](col.custom_field.key)
        end
        !!custom_field_value && (custom_field_value == col.key || custom_field_value.include?(col.key))
      else
        raise 'Invalid column type'
      end
    end

    def column_set_for_reaction?(reaction, col)
      case col
      when Tag
        tag_map[reaction.reactable_id]&.include?(col.id)
      when CustomFieldOption
        custom_field_value = if col.custom_field.custom_form_type?
          reaction.reactable.custom_field_values[col.custom_field.key]
        else
          reaction && reaction.user&.custom_field_values&.[](col.custom_field.key)
        end
        !!custom_field_value && (custom_field_value == col.key || custom_field_value.include?(col.key))
      else
        raise 'Invalid column type'
      end
    end

    def column_set_for_participant?(input, participant, col)
      case col
      when Tag
        tag_map[input.id]&.include?(col.id)
      when CustomFieldOption
        custom_field_value = if col.custom_field.custom_form_type?
          input.custom_field_values[col.custom_field.key]
        else
          participant.custom_field_values[col.custom_field.key]
        end
        !!custom_field_value && (custom_field_value == col.key || custom_field_value.include?(col.key))
      else
        raise 'Invalid column type'
      end
    end

    def participant_to_inputs_map
      return @participant_to_inputs_map if @participant_to_inputs_map

      output = Hash.new { |hash, key| hash[key] = [] }
      pc = ParticipantsService.new

      all_inputs.each do |input|
        pc.ideas_participants(Idea.where(id: input)).each do |participant|
          output[participant] << input
        end
      end

      @participant_to_inputs_map = output
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

    # maps input_ids to tag_id arrays. Performance optimization
    def tag_map
      @tag_map ||=
        @analysis.taggings.select(:input_id, :tag_id).each_with_object({}) do |tagging, hash|
          hash[tagging.input_id] ||= []
          hash[tagging.input_id] << tagging.tag_id
        end
    end
  end
end
