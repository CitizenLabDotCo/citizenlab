# frozen_string_literal: true

#
# The AutoInsightsService combines all inputs and user fields to calculate
# correlation. Its goal is to highlight certain patterns toward the user, where
# certain user groups are more likely to answer in a certain way, or users who
# give a certain answer to a certain question are more likely to give a certain
# answer to another question. This is done by calculating the correlation.
module Analysis
  class AutoInsightsService
    def initialize(analysis)
      @analysis = analysis
    end

    def generate(unit: 'inputs', tags: detect_tags, user_custom_fields: detect_user_custom_fields, input_custom_fields: detect_input_custom_fields)
      matrix = big_fat_matrix(unit, tags:, user_custom_fields:, input_custom_fields:)
      matrix
        .flat_map(&:keys)
        .uniq # => [col1, col2, col3]
        .group_by { |col| col_to_category(col) } # => { category1 => [col1, col2], category2 => [col3] }
        .values # => [[col1, col2], [col3]]
        .combination(2) # => [[[col1, col2], [col3]]]
        .each do |(category1, category2)|
        cells =
          category1.flat_map do |col1|
            category2.map do |col2|
              ct = contingency_table(matrix, col1, col2)
              count = ct[[true, true]]
              _chi2, p_value = chi_square(ct)
              HeatmapCell.new(
                row: col1,
                column: col2,
                analysis: @analysis,
                unit:,
                p_value:,
                count:
              )
            end
          end

        add_lift!(cells)
        HeatmapCell.insert_all!(
          cells.map do |cell|
            cell.attributes.except('id', 'created_at', 'updated_at')
              .merge(
                created_at: Time.current,
                updated_at: Time.current
              )
          end
        )
      end
    end

    # The big fat matrix takes the given, or all inputs, user custom fields and taggings and
    # throws them together in a large, one-hot (only booleans) encoded table
    def big_fat_matrix(unit, **)
      case unit
      when 'inputs'
        big_fat_matrix_helper(
          items: @analysis.inputs.includes(:author),
          inputs_custom_field_values: ->(item) { [item.custom_field_values] },
          author: ->(item) { item.author },
          input_ids: ->(item) { [item.id] },
          **
        )
      when 'likes', 'dislikes'
        big_fat_matrix_helper(
          items: Reaction
            .where(reactable_type: 'Idea', reactable_id: @analysis.inputs, mode: unit == 'likes' ? 'up' : 'down')
            .includes(:user, :reactable),
          inputs_custom_field_values: ->(reaction) { [reaction.reactable.custom_field_values] },
          author: ->(reaction) { reaction.user },
          input_ids: ->(reaction) { [reaction.reactable_id] },
          **
        )
      when 'participants'
        big_fat_matrix_helper(
          items: participant_to_inputs_map.keys,
          inputs_custom_field_values: ->(participant) { participant_to_inputs_map[participant].map(&:custom_field_values) },
          author: ->(participant) { participant },
          input_ids: ->(participant) { participant_to_inputs_map[participant].map(&:id) },
          **
        )
      else
        raise "Invalid unit #{unit}"
      end
    end

    def big_fat_matrix_helper(
      items:,
      inputs_custom_field_values:,
      author:,
      input_ids:,
      tags:,
      user_custom_fields:,
      input_custom_fields:
    )
      items.map do |item|
        row = {}

        # Add columns for tags
        ids = input_ids.call(item)
        tags.each do |tag|
          row[tag] = ids.any? { |id| tag_map(tags).dig(id, tag.id) }
        end

        # Add columns for input custom fields
        input_custom_fields.map do |input_custom_field|
          custom_field_values = inputs_custom_field_values.call(item).map { |cfv| cfv[input_custom_field.key] }
          next unless custom_field_values.compact.empty?

          input_custom_field.options.map do |option|
            row[option] = custom_field_values.flatten.include?(option.key)
          end
        end

        # Add columns for user custom fields
        if (item_author = author.call(item))
          user_custom_fields.each do |user_custom_field|
            custom_field_value = item_author.custom_field_values[user_custom_field.key]
            next unless custom_field_value

            user_custom_field.options.each do |option|
              row[option] = custom_field_value == option.key || custom_field_value.include?(option.key)
            end
          end
        end

        row
      end
    end

    def col_to_category(col)
      case col
      when Tag
        :tags
      when CustomFieldOption
        col.custom_field
      else
        raise 'Invalid column type'
      end
    end

    private

    def detect_input_custom_fields
      CustomField.where(id: @analysis.associated_custom_fields).includes(:options).select(&:support_options?)
    end

    def detect_user_custom_fields
      CustomField.registration.enabled.includes(:options).select(&:support_options?)
    end

    def detect_tags
      @analysis.tags
    end

    # Nested hash to quickly check whether a certain input has a certain tag
    def tag_map(tags)
      @tag_map ||= {}
      @tag_map[tags] ||=
        Tagging.where(tag: tags)
          .select(:input_id, :tag_id)
          .group_by(&:input_id)
          .transform_values { |taggings| taggings.each_with_object({}) { |tagging, hash| hash[tagging.tag_id] = true } }
    end

    def participant_to_inputs_map
      return @participant_to_inputs_map if @participant_to_inputs_map

      output = Hash.new { |hash, key| hash[key] = [] }
      pc = ParticipantsService.new

      @analysis.inputs
        .select(:id, :custom_field_values, :author_id)
        .includes(:author, :taggings).each do |input|
        pc.ideas_participants(Idea.where(id: input)).each do |participant|
          output[participant] << input
        end
      end

      @participant_to_inputs_map = output
    end

    # Method to create a contingency table for two columns
    def contingency_table(data, col1, col2)
      table = Hash.new(0)

      [true, false].product([true, false]) do |v1, v2|
        table[[v1, v2]] = 0
      end

      data.each do |row|
        table[[!!row[col1], !!row[col2]]] += 1
      end

      table
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

    def add_lift!(cells)
      total = cells.sum(&:count)
      row_total = cells.group_by(&:row).transform_values { |v| v.sum(&:count) }
      col_total = cells.group_by(&:column).transform_values { |v| v.sum(&:count) }
      cells.each do |cell|
        cell.lift = if cell.count == 0
          0
        else
          expected = (row_total[cell.row] * col_total[cell.column]) / total.to_f
          cell.count / expected
        end
      end
    end
  end
end
