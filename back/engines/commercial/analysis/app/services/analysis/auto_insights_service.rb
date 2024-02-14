# frozen_string_literal: true
#
# The AutoInsightsService combines all inputs and user fields to calculate
# correlation. Its goal is to highlight certain patterns toward the user, where
# certain user groups are more likely to answer in a certain way, or users who
# give a certain answer to a certain question are more likely to give a certain
# answer to another question. This is done by calculating the correlation.
module Analysis
  class AutoInsightsService

    def initialize(phase)
      @phase = phase
    end

    def call
      matrix = big_fat_matrix

      significant_correlations = []

      matrix.flat_map(&:keys).uniq.combination(2)
      .reject{|col1, col2| col1.custom_field_id == col2.custom_field_id}
      .map do |col1, col2|
        ct = contingency_table(matrix, col1, col2)
        chi2, p_value = chi_square(ct)

        significant_correlations << [col1.key, col2.key, chi2, p_value]# if p_value < 0.05
      end

      significant_correlations.sort_by { |_, _, chi2, _| -chi2 }
    end

    # The big fat matrix takes all inputs, user custom fields and taggings and
    # throws them together in a large, one-hot (only booleans) encoded table
    def big_fat_matrix
      input_custom_fields = detect_input_custom_fields.includes(:options)
      user_custom_fields = detect_user_custom_fields
      tags = detect_tags

      Idea.published.where(creation_phase_id: @phase).includes(:author).map do |input|
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
          row[tag] = tag.input_ids.include?(input.id)
        end

        row
      end
    end

    private

    def custom_form
      participation_method = Factory.instance.participation_method_for(@phase)
      # to do: generalize for ideation
      @phase.custom_form || participation_method.create_default_form!
    end

    def detect_input_custom_fields
      custom_form.custom_fields
    end

    def detect_user_custom_fields
      CustomField.registration.enabled.includes(:options).select(&:support_options?)
    end

    def detect_tags
      custom_form.participation_context.analyses.flat_map do |analysis|
        analysis.tags
      end
    end


    # Method to create a contingency table for two columns
    def contingency_table(data, col1, col2)
      table = Hash.new(0)

      [true, false].product([true, false, nil]) do |v1, v2|
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

        chi2 += expected > 0 ? ((observed - expected) ** 2) / expected : 0
      end
    
      dof = (row_sums.size - 1) * (col_sums.size - 1)
      p_value = 1 - Distribution::ChiSquare.cdf(chi2, dof)
      [chi2, p_value]
    end
  end
end