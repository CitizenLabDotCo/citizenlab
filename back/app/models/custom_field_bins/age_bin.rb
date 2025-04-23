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
#  index_custom_field_bins_on_custom_field_id         (custom_field_id)
#  index_custom_field_bins_on_custom_field_option_id  (custom_field_option_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#  fk_rails_...  (custom_field_option_id => custom_field_options.id)
#
module CustomFieldBins
  class AgeBin < ::CustomFieldBin
    validates :range, presence: true
    validates :values, :custom_field_option_id, absence: true

    validate :custom_field_is_birthyear
    validate :range_is_numerical
    validate :range_is_positive
    validate :range_is_increasing

    def in_bin?(value)
      return false if value.nil?

      birthyear_range.cover?(value)
    end

    def filter_by_bin(scope)
      scope.where("(custom_field_values->>'#{custom_field.key}')::integer IN (?)", birthyear_range)
    end

    def self.generate_bins(custom_field)
      return if custom_field.custom_field_bins.any?

      # We hardcode to use only 5 age buckets, to increase the chance of
      # achieving statistically significant auto-insights at the expense of
      # detail
      [0, 20, 40, 60, 80, nil].each_cons(2) do |low, high|
        create!(custom_field:, range: low...high)
      end
    end

    def self.supports_custom_field?(custom_field)
      # We only support the birthyear field
      custom_field.code == 'birthyear'
    end

    private

    def range_is_numerical
      errors.add(:range, 'must be numerical') unless range.begin.is_a?(Integer) && (range.end.is_a?(Integer) || range.end.nil? || range.end == Float::INFINITY)
    end

    def range_is_positive
      errors.add(:range, 'must be positive') if range.begin.negative?
    end

    def range_is_increasing
      errors.add(:range, 'must be increasing') if range.end.present? && range.begin >= range.end
    end

    def custom_field_is_birthyear
      errors.add(:custom_field, 'must be a birthyear field') unless custom_field.code == 'birthyear'
    end

    # The range is stored as 2 age values, we need to convert them to birthyear
    # to compare to the database content
    def birthyear_range
      age_counter = UserCustomFields::AgeCounter.new
      start_year = age_counter.convert_to_birthyear(range.end || Float::INFINITY)
      end_year = age_counter.convert_to_birthyear(range.begin || -Float::INFINITY)
      start_year...end_year
    end
  end
end
