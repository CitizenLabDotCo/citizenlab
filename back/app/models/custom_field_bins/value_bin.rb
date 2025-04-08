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
  # A ValueBin groups custom field values that are equal to (a) specific value(s)
  class ValueBin < ::CustomFieldBin
    validates :values, presence: true
    validates :range, :custom_field_option_id, absence: true

    validate :values_is_array
    validate :values_is_heterogeneous
    validate :values_is_not_empty

    def in_bin?(value)
      return false if value.nil?

      values.include?(value)
    end

    def filter_by_bin(scope)
      case custom_field.input_type
      when 'checkbox'
        scope.where("(custom_field_values->>'#{custom_field.key}')::boolean in (?)", values)
      when 'linear_scale', 'rating', 'sentiment_linear_scale'
        scope.where("(custom_field_values->>'#{custom_field.key}')::integer in (?)", values)
      end
    end

    def self.supports_custom_field?(custom_field)
      %w[checkbox linear_scale rating number sentiment_linear_scale].include?(custom_field.input_type)
    end

    def self.generate_bins(custom_field)
      return if custom_field.custom_field_bins.any?

      case custom_field.input_type
      when 'checkbox'
        create!(custom_field:, values: [true])
        create!(custom_field:, values: [false])
      when 'linear_scale', 'rating', 'sentiment_linear_scale'
        (1..custom_field.maximum).each do |i|
          create!(custom_field:, values: [i])
        end
      end
    end

    private

    def values_is_array
      errors.add(:values, 'must be an array') unless values.is_a?(Array)
    end

    def values_is_heterogeneous
      errors.add(:values, 'must have values of the same type') if values && values.map(&:class).uniq.size > 1
    end

    def values_is_not_empty
      errors.add(:values, 'must not be empty') if values && values.empty?
    end
  end
end
