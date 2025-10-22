# frozen_string_literal: true

class AddUniqueIndexesToCustomFieldBins < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def up
    # OptionBin: unique on [custom_field_id, custom_field_option_id] when type is CustomFieldBins::OptionBin
    add_index :custom_field_bins,
      %i[custom_field_id custom_field_option_id],
      unique: true,
      where: "type = 'CustomFieldBins::OptionBin'",
      name: 'index_option_bins_on_cf_and_option',
      algorithm: :concurrently

    # ValueBin: unique on [custom_field_id, values] when type is CustomFieldBins::ValueBin
    add_index :custom_field_bins,
      %i[custom_field_id values],
      unique: true,
      where: "type = 'CustomFieldBins::ValueBin'",
      name: 'index_value_bins_on_cf_and_values',
      algorithm: :concurrently

    # RangeBin: unique on [custom_field_id, range] when type is CustomFieldBins::RangeBin
    add_index :custom_field_bins,
      %i[custom_field_id range],
      unique: true,
      where: "type = 'CustomFieldBins::RangeBin'",
      name: 'index_range_bins_on_cf_and_range',
      algorithm: :concurrently

    # AgeBin: unique on [custom_field_id, range] when type is CustomFieldBins::AgeBin
    add_index :custom_field_bins,
      %i[custom_field_id range],
      unique: true,
      where: "type = 'CustomFieldBins::AgeBin'",
      name: 'index_age_bins_on_cf_and_range',
      algorithm: :concurrently
  end

  def down
    remove_index :custom_field_bins, name: 'index_option_bins_on_cf_and_option'
    remove_index :custom_field_bins, name: 'index_value_bins_on_cf_and_values'
    remove_index :custom_field_bins, name: 'index_range_bins_on_cf_and_range'
    remove_index :custom_field_bins, name: 'index_age_bins_on_cf_and_range'
  end
end
