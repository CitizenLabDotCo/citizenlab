# frozen_string_literal: true

module UserCustomFields
  class AgeCounter
    Result = Struct.new(:binned_counts, :unknown_age_count, :bins)

    DEFAULT_BINS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, nil].freeze

    # Counts users by age bins
    # @param [ActiveRecord::Relation, Array<Hash>] records_or_values - Either:
    #   - ActiveRecord relation of users
    #   - Array of custom_field_values hashes (for in-memory processing)
    # @param [Array<Numeric,nil>] bins - Age bin boundaries
    # @return [Result] with binned_counts, unknown_age_count, and bins
    def count(records_or_values, bins = nil)
      bins ||= DEFAULT_BINS
      birthyear_custom_field = CustomField.find_by(key: 'birthyear')
      birthyear_counts = FieldValueCounter.counts_by_field_option(records_or_values, birthyear_custom_field)

      unknown_age_count = birthyear_counts.delete(FieldValueCounter::UNKNOWN_VALUE_LABEL)

      # Convert birthyears to ages, filtering out invalid conversions
      age_counts = {}
      birthyear_counts.each do |birthyear, count|
        age = convert_to_age(birthyear)
        if age.nil?
          unknown_age_count += count
        else
          age_counts[age] = (age_counts[age] || 0) + count
        end
      end

      binned_counts = bin_data(age_counts, bins)

      Result.new(binned_counts, unknown_age_count, bins)
    end

    def convert_to_age(birthyear, time: Time.zone.now)
      # Handle invalid birthyear values
      begin
        birthyear_int = Integer(birthyear)
      rescue ArgumentError, TypeError
        # Return nil for invalid values - they'll be filtered out later
        return nil
      end

      # Since we don't known the exact birth date, we estimate it as the middle of the
      # year: July 1st of the year of birth.
      birth_time = Time.zone.local(birthyear_int, 7, 1)
      age = (time - birth_time) / 1.year
      return 0 if age < 0 # Catch negative ages for those under 6 months (extreme edge case)

      age
    end

    def convert_to_birthyear(age, time: Time.zone.now)
      if age == Float::INFINITY
        - Float::INFINITY
      else
        (time - (age.year + 6.months)).year
      end
    end

    private

    # @param [Hash] counts
    # @param [Array<Numeric,nil>] bins
    def bin_data(counts, bins)
      bins = bins.dup
      bins[0] = 0 if bins.first.nil?
      bins[-1] = Float::INFINITY if bins.last.nil?

      raise ArgumentError, 'only first and last bins can be open-ended' if bins.include?(nil)
      raise ArgumentError, 'bins must increase monotonically' unless bins.compact.sorted?

      counts = counts.sort.select { |key, _count| bins.min <= key && key < bins.last }

      # Counts in the same bin are added together.
      # We use the right boundary of the bin as a grouping key.
      binned_data = bins.drop(1).index_with(0)

      counts.each do |(key, count)|
        bins = bins.drop_while { |bin| bin <= key }
        binned_data[bins.first] += count
      end

      binned_data.sort.map(&:second)
    end
  end
end
