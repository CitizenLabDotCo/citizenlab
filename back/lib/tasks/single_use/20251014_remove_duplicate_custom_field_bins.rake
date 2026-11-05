# frozen_string_literal: true

namespace :single_use do
  desc 'Remove duplicate CustomFieldBin records before adding unique constraints'
  task remove_duplicate_custom_field_bins: [:environment] do
    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # OptionBin duplicates
      option_bin_duplicates = CustomFieldBin
        .where(type: 'CustomFieldBins::OptionBin')
        .group(:custom_field_id, :custom_field_option_id)
        .having('COUNT(*) > 1')
        .count

      option_bin_duplicates.each_key do |(custom_field_id, custom_field_option_id)|
        bins = CustomFieldBin
          .where(
            type: 'CustomFieldBins::OptionBin',
            custom_field_id: custom_field_id,
            custom_field_option_id: custom_field_option_id
          )
          .order(:created_at)

        # Keep the oldest, delete the rest
        bins.offset(1).each do |bin|
          reporter.add_delete(
            'CustomFieldBin',
            bin.id,
            context: {
              tenant: tenant.host,
              type: 'OptionBin',
              custom_field_id: custom_field_id,
              custom_field_option_id: custom_field_option_id
            }
          )
          bin.destroy!
        end
      end

      # ValueBin duplicates
      value_bin_duplicates = CustomFieldBin
        .where(type: 'CustomFieldBins::ValueBin')
        .group(:custom_field_id, :values)
        .having('COUNT(*) > 1')
        .count

      value_bin_duplicates.each_key do |(custom_field_id, values)|
        bins = CustomFieldBin
          .where(
            type: 'CustomFieldBins::ValueBin',
            custom_field_id: custom_field_id,
            values: values
          )
          .order(:created_at)

        bins.offset(1).each do |bin|
          reporter.add_delete(
            'CustomFieldBin',
            bin.id,
            context: {
              tenant: tenant.host,
              type: 'ValueBin',
              custom_field_id: custom_field_id,
              values: values
            }
          )
          bin.destroy!
        end
      end

      # RangeBin duplicates
      range_bin_duplicates = CustomFieldBin
        .where(type: 'CustomFieldBins::RangeBin')
        .group(:custom_field_id, :range)
        .having('COUNT(*) > 1')
        .count

      range_bin_duplicates.each_key do |(custom_field_id, range)|
        bins = CustomFieldBin
          .where(
            type: 'CustomFieldBins::RangeBin',
            custom_field_id: custom_field_id,
            range: range
          )
          .order(:created_at)

        bins.offset(1).each do |bin|
          reporter.add_delete(
            'CustomFieldBin',
            bin.id,
            context: {
              tenant: tenant.host,
              type: 'RangeBin',
              custom_field_id: custom_field_id,
              range: range.to_s
            }
          )
          bin.destroy!
        end
      end

      # AgeBin duplicates
      age_bin_duplicates = CustomFieldBin
        .where(type: 'CustomFieldBins::AgeBin')
        .group(:custom_field_id, :range)
        .having('COUNT(*) > 1')
        .count

      age_bin_duplicates.each_key do |(custom_field_id, range)|
        bins = CustomFieldBin
          .where(
            type: 'CustomFieldBins::AgeBin',
            custom_field_id: custom_field_id,
            range: range
          )
          .order(:created_at)

        bins.offset(1).each do |bin|
          reporter.add_delete(
            'CustomFieldBin',
            bin.id,
            context: {
              tenant: tenant.host,
              type: 'AgeBin',
              custom_field_id: custom_field_id,
              range: range.to_s
            }
          )
          bin.destroy!
        end
      end
    end

    reporter.report!('remove_duplicate_custom_field_bins_report.json', verbose: true)
  end
end
