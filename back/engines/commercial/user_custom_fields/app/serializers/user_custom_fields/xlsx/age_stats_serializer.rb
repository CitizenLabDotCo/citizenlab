# frozen_string_literal: true

module UserCustomFields
  module Xlsx
    module AgeStatsSerializer
      extend self

      # @param [UserCustomField::AgeStats] age_stats
      def generate(age_stats)
        xlsx_columns = compute_columns(age_stats)
        XlsxService.new.xlsx_from_columns(xlsx_columns, sheetname: 'users_by_age')
      end

      private

      # @param [UserCustomField::AgeStats] age_stats
      def compute_columns(age_stats)
        columns = {
          'age' => age_ranges_column(age_stats.bins),
          'user_count' => age_stats.binned_counts,
          'expected_user_count' => age_stats.expected_binned_counts,
          'total_population' => age_stats.population_counts
        }.compact

        # Copy (+dup+) the columns because +add_row+ modifies the column arrays in-place.
        columns.transform_values!(&:dup)
        add_row(columns, 'age' => 'unknown', 'user_count' => age_stats.unknown_age_count)
        columns
      end

      # @param [Hash<String,Array>] columns
      # @param [Hash<String,Object>] row
      def add_row(columns, row)
        columns.each_key do |k|
          columns[k] << row[k]
        end
      end

      def age_ranges_column(bins)
        bins = bins.dup
        bins[0] = 0 if bins.first.nil?

        bins.each_cons(2).map do |lower, upper|
          upper.nil? ? "#{lower}+" : "#{lower}-#{upper - 1}"
        end
      end
    end
  end
end
