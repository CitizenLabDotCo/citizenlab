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
  # An OptionBin groups custom field values that are equal to (a) specific value(s)
  class OptionBin < ::CustomFieldBin
    belongs_to :custom_field_option
    validates :values, :range, absence: true

    def in_bin?(value)
      return false if value.nil? || custom_field_option_value.nil?

      value == custom_field_option_value || value.include?(custom_field_option_value)
    end

    def filter_by_bin(scope)
      case custom_field.input_type
      when 'select'
        scope.where("custom_field_values->>'#{custom_field.key}' = ?", custom_field_option_value)
      when 'multiselect'
        scope.where("custom_field_values->'#{custom_field.key}' @> ?", custom_field_option_value.to_json)
      end
    end

    def self.generate_bins(custom_field)
      return if custom_field.custom_field_bins.any?

      custom_field.options.order(:ordering).each do |option|
        create!(custom_field:, custom_field_option: option)
      end
    end

    def self.supports_custom_field?(custom_field)
      %w[select select_image multiselect multiselect_image].include?(custom_field.input_type)
    end

    private

    def custom_field_option_value
      if custom_field.domicile?
        # For the domicile the value stores in custom_field_values is the area
        # id, whereas the custom_field_option this bin is associated to is an
        # instance that is kept in sync between the area and the custom field
        # options through code in the `area` model
        custom_field_option.area&.id
      else
        custom_field_option.key
      end
    end
  end
end
