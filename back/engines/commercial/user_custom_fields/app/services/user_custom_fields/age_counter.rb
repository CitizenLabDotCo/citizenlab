# frozen_string_literal: true

module UserCustomFields
  class AgeCounter
    Result = Struct.new(:age_counts, :unknown_count, :bins)

    DEFAULT_BINS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, nil].freeze

    def count(users, bins = nil)
      bins ||= DEFAULT_BINS
      birthyear_custom_field = CustomField.find_by(key: 'birthyear')
      birthyear_counts = FieldValueCounter.counts_by_field_option(users, birthyear_custom_field)

      unknown_birthyear_count = birthyear_counts.delete(FieldValueCounter::UNKNOWN_VALUE_LABEL)
      age_counts = birthyear_counts.transform_keys { |birthyear| convert_to_age(birthyear, precision: 1) }
      binned_counts = bin_data(age_counts, bins)

      Result.new(binned_counts, unknown_birthyear_count, bins)
    end

    private

    def convert_to_age(birthyear, time: Time.zone.now, precision: 0)
      # Estimated birth date (time) is July 1st of the year of birth
      birth_time = Time.zone.local(birthyear, 7, 1)
      age = (time - birth_time) / 1.year
      age.round(precision)
    end

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
