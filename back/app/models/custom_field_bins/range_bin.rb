# == Schema Information
#
# Table name: custom_field_bins
#
#  id                     :uuid             not null, primary key
#  type                   :string           not null
#  custom_field_id        :uuid
#  custom_field_option_id :uuid
#  values                 :jsonb
#  range                  :int4range
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_age_bins_on_cf_and_range                     (custom_field_id,range) UNIQUE WHERE ((type)::text = 'CustomFieldBins::AgeBin'::text)
#  index_custom_field_bins_on_custom_field_id         (custom_field_id)
#  index_custom_field_bins_on_custom_field_option_id  (custom_field_option_id)
#  index_option_bins_on_cf_and_option                 (custom_field_id,custom_field_option_id) UNIQUE WHERE ((type)::text = 'CustomFieldBins::OptionBin'::text)
#  index_range_bins_on_cf_and_range                   (custom_field_id,range) UNIQUE WHERE ((type)::text = 'CustomFieldBins::RangeBin'::text)
#  index_value_bins_on_cf_and_values                  (custom_field_id,values) UNIQUE WHERE ((type)::text = 'CustomFieldBins::ValueBin'::text)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#  fk_rails_...  (custom_field_option_id => custom_field_options.id)
#
module CustomFieldBins
  class RangeBin < ::CustomFieldBin
    validates :range, presence: true
    validates :values, :custom_field_option_id, absence: true

    validate :range_is_increasing

    def in_bin?(value)
      return false if value.nil?

      range.cover?(value)
    end

    def filter_by_bin(scope)
      scope.where("(custom_field_values->>'#{custom_field.key}')::integer IN (?)", range)
    end

    def self.generate_bins(custom_field,
      lower_bound: find_lowest_value(custom_field),
      upper_bound: find_highest_value(custom_field),
      bin_count: 4)
      return if custom_field.custom_field_bins.any?

      interval = (upper_bound - lower_bound) / bin_count.to_f

      return if interval.zero?

      [*Array.new(bin_count) { (lower_bound + (interval * _1)).round }, upper_bound].each_cons(2) do |low, high|
        create!(custom_field:, range: low...high)
      end
    end

    def self.supports_custom_field?(custom_field)
      # NTH: add date support
      %w[number].include?(custom_field.input_type)
    end

    def self.find_lowest_value(custom_field)
      custom_field.items_claz.minimum("(custom_field_values->>'#{custom_field.key}')::integer")
    end

    def self.find_highest_value(custom_field)
      custom_field.items_claz.maximum("(custom_field_values->>'#{custom_field.key}')::integer")
    end

    private

    def range_is_increasing
      errors.add(:range, 'must be increasing') if range.present? && range.begin >= range.end
    end
  end
end
