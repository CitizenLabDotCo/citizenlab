# frozen_string_literal: true

module UserCustomFields
  # An +AgeStats+ instance holds various statistics / count data about a set of users.
  #
  # Note:
  # This model is not an ActiveRecord model and is not persisted in the database. It
  # subclasses +ActiveModelSerializers::Model+ to facilitate its use with
  # `active_model_serializers`.
  class AgeStats < ActiveModelSerializers::Model
    attributes :user_count, :reference_distribution, :counter_result

    delegate :binned_counts, :unknown_age_count, :bins, to: :counter_result

    # Calculates age statistics for a set of users or custom field values
    # @param [ActiveRecord::Relation, Array<Hash>] records_or_values - Either:
    #   - ActiveRecord relation of users
    #   - Array of custom_field_values hashes (for in-memory processing)
    # @return [AgeStats] instance with calculated statistics
    def self.calculate(records_or_values)
      reference_distribution = CustomField.find_by(key: 'birthyear').current_ref_distribution

      new(
        user_count: records_or_values.count,
        reference_distribution: reference_distribution,
        counter_result: AgeCounter.new.count(records_or_values, reference_distribution&.bin_boundaries)
      )
    end

    # Formats both user counts and reference population into labeled age ranges
    # Example usage:
    #   age_stats = UserCustomFields::AgeStats.calculate(users)
    #   age_stats.format_in_ranges
    # @return [Hash] :series and :reference_distribution with age ranges as keys
    # @example
    #   {
    #     ranged_series: {
    #       "18-44" => 45,
    #       "45-64" => 123,
    #       "65+" => 23,
    #       "_blank" => 12
    #     },
    #     ranged_reference_distribution: {
    #       "18-44" => 150,
    #       "45-64" => 200,
    #       "65+" => 80
    #     }
    #   }
    def format_in_ranges
      series_data = {}
      reference_data = {}

      bins[0...-1].each_with_index do |bin_value, index|
        next_bin = bins[index + 1]

        range_label = if next_bin.nil?
          "#{bin_value}+"
        else
          "#{bin_value}-#{next_bin - 1}"
        end

        series_data[range_label] = binned_counts[index] || 0
        reference_data[range_label] = population_counts&.[](index) || 0
      end

      series_data['_blank'] = unknown_age_count

      {
        ranged_series: series_data,
        ranged_reference_distribution: reference_data
      }
    end

    # The reference population counts.
    # @return [Array<Integer>, nil]
    def population_counts
      reference_distribution&.counts
    end
  end
end
