module UserCustomFields
  class NumericFieldCounter
    Result = Struct.new(:binned_counts, :unknown_count, :bins)

    DEFAULT_BIN_COUNT = 10

    def count(records_or_values, custom_field, bins = nil, bin_count = DEFAULT_BIN_COUNT)
      field_counts = FieldValueCounter.counts_by_field_option(records_or_values, custom_field)
      
      unknown_count = field_counts.delete(FieldValueCounter::UNKNOWN_VALUE_LABEL) || 0
      
      # Treat empty strings as unknown values
      empty_string_count = field_counts.delete('') || 0
      unknown_count += empty_string_count
      
      # Convert string keys to numeric values
      numeric_counts = {}
      field_counts.each do |key, count|
        # Skip if key is empty or whitespace (already handled above, but extra safety)
        next if key.to_s.strip.empty?
        
        numeric_value = key.to_f
        # Include all finite numbers, including zero (e.g. excludes 'infinity'.to_f)
        if numeric_value.finite?
          numeric_counts[numeric_value] = count
        else
          unknown_count += count
        end
      end
      
      if numeric_counts.empty?
        bins ||= [0, 10]
        return Result.new([0], unknown_count, bins)
      end
      
      bins ||= calculate_closed_bins(numeric_counts.keys, bin_count)
      binned_counts = bin_data(numeric_counts, bins)

      Result.new(binned_counts, unknown_count, bins)
    end

    private

    # Calculate bins that fully cover min to max values (no open-ended bins)
    def calculate_closed_bins(values, bin_count)
      return [0, 10] if values.empty?

      min_val = values.min
      max_val = values.max
      
      # Handle case where all values are the same
      if min_val == max_val
        return [min_val, min_val + 1]
      end

      # Extend range slightly to ensure max value is included
      range = max_val - min_val
      adjusted_max = max_val + (range * 0.01) # Add 1% to include max value
      
      bin_width = (adjusted_max - min_val) / bin_count

      # Create bin boundaries from min to adjusted_max
      (0..bin_count).map do |i|
        (min_val + (bin_width * i)).round(2)
      end
    end

    # Simpler binning without nil handling
    def bin_data(counts, bins)
      raise ArgumentError, 'bins must increase monotonically' unless bins.sort == bins

      # Initialize bin counts (one less than boundaries)
      binned_data = Array.new(bins.length - 1, 0)

      counts.each do |value, count|
        # Find which bin this value belongs to
        bin_index = nil
        
        (0...bins.length - 1).each do |i|
          if value >= bins[i] && value < bins[i + 1]
            bin_index = i
            break
          end
        end
        
        # Handle edge case where value equals the max boundary
        if bin_index.nil? && value == bins.last
          bin_index = bins.length - 2
        end
        
        binned_data[bin_index] += count if bin_index
      end

      binned_data
    end
  end
end
