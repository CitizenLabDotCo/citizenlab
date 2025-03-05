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

    def chi_square_analysis
      matrix = big_fat_matrix

      significant_associations = []

      matrix.flat_map(&:keys).uniq.combination(2)
        .reject { |col1, col2| col1.class == col2.class }
        # .reject { |col1, col2| col1 == col2 || (col1.try(:custom_field_id) == col2.try(:custom_field_id) && col1.try(:custom_field_id).present?) }
        .map do |col1, col2|
        ct = contingency_table(matrix, col1, col2)
        # debugger if col1.try(:name) == 'Education' && col2.try(:name) == 'Education and Schools'
        chi2, p_value = chi_square(ct)

        significant_associations << [col1, col2, chi2, p_value] if p_value < 0.05
      end

      significant_associations.sort_by { |_, _, chi2, _| -chi2 }
    end

    # Receives the output from call and pretty prints it
    def pretty_print(chi_square_analysis_output)
      chi_square_analysis_output.map do |col1, col2, chi2, p_value|
        "#{col1.try(:key) || col1.try(:name)} - #{col2.try(:key) || col2.try(:name)}: chi2=#{chi2}, p=#{p_value}"
      end
    end

    # The big fat matrix takes the gives, or all inputs, user custom fields and taggings and
    # throws them together in a large, one-hot (only booleans) encoded table
    def big_fat_matrix(tags: nil, user_custom_fields: nil, input_custom_fields: nil)
      input_custom_fields ||= detect_input_custom_fields
      user_custom_fields ||= detect_user_custom_fields
      tags ||= detect_tags
      tag_map = tag_map(tags)

      @analysis.inputs.includes(:author).map do |input|
        row = {}

        # Add columns for input custom fields
        input_custom_fields.map do |input_custom_field|
          custom_field_value = input.custom_field_values[input_custom_field.key]
          next unless custom_field_value

          input_custom_field.options.map do |option|
            row[option] = custom_field_value == option.key || custom_field_value.include?(option.key)
          end
        end

        # Add columns for user custom fields
        if input.author
          user_custom_fields.each do |user_custom_field|
            custom_field_value = input.author.custom_field_values[user_custom_field.key]
            next unless custom_field_value

            user_custom_field.options.each do |option|
              row[option] = custom_field_value == option.key || custom_field_value.include?(option.key)
            end
          end
        end

        # Add columns for tags
        tags.each do |tag|
          row[tag] = !!tag_map[input.id][tag]
        end

        row
      end
    end

    # Returns all the other columns in the same category as the given column. Category means:
    # - For tag columns, all the tags in the analysis
    # - For custom field options, all the options in the custom field
    def col_to_category(col)
      @all_cols_in_category ||= {}
      @all_cols_in_category[col] ||= case col
      when Tag
        detect_tags
      when CustomFieldOption
        col.custom_field.options
      else
        raise 'Invalid column type'
      end
    end

    private

    def detect_input_custom_fields
      @analysis.associated_custom_fields
    end

    def detect_user_custom_fields
      CustomField.registration.enabled.includes(:options).select(&:support_options?)
    end

    def detect_tags
      @analysis.tags
    end

    # Nested hash to quickly check whether a certain input has a certain tag
    def tag_map(tags)
      tag_map = Hash.new { |h, k| h[k] = {} }
      tags.each do |tag|
        tag.input_ids.each do |input_id|
          tag_map[input_id][tag] = true
        end
      end
      tag_map
    end

    # Method to create a contingency table for two columns
    def contingency_table(data, col1, col2)
      table = Hash.new(0)

      [true, false].product([true, false]) do |v1, v2|
        table[[v1, v2]] = 0
      end

      data.each do |row|
        table[[row[col1], row[col2]]] += 1
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
  end
end
