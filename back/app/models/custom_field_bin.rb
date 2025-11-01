# frozen_string_literal: true

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

# A CustomFieldBin defines a subdivision, often relevant for
# statistical/graphing purposes, over the answer-values of a CustomField. This
# is used, for example in the case of a custom field that contains a numerical
# value, and we want to define ranges over which to group the values.
# The CustomFieldBin is an abstract class, its subclasses implement the specific
# bin definitions for the various CustomFields. We're using
# Single-Table-Inheritance to store them in the database
class CustomFieldBin < ApplicationRecord
  belongs_to :custom_field

  validate :custom_field_type_supported

  def self.policy_class
    CustomFieldBinPolicy
  end

  # Does the given value fall into this bin.
  # - `value` is the custom_field_value for the custom_field, as extracted from the custom_field_values
  def in_bin?(value)
    raise NotImplementedError
  end

  # Returns the given ActiveRecord scope, filtered for items that are in this bin
  # The resource covered by the scope needs to have a `custom_field_values` column (users or ideas)
  def filter_by_bin(scope)
    raise NotImplementedError
  end

  # Returns an array of input_types that this bin subclass can be used for
  def self.supports_custom_field?(_custom_field)
    raise NotImplementedError
  end

  # Generates the bins for a given custom_field. Does nothing if they already
  # exist. Should be overriden in subclasses and call super
  # to ensure the default behavior is executed.
  def self.generate_bins(custom_field)
    nil if custom_field.custom_field_bins.any?
  end

  def self.regenerate_bins!(custom_field)
    # Delete all existing bins
    custom_field.custom_field_bins.destroy_all

    # Generate new bins
    generate_bins(custom_field)
  end

  def self.find_bin_claz_for(custom_field)
    [
      CustomFieldBins::AgeBin,
      CustomFieldBins::ValueBin,
      CustomFieldBins::RangeBin,
      CustomFieldBins::OptionBin
    ].find do |klaz|
      klaz.supports_custom_field?(custom_field)
    end
  end

  private

  # Validates that the custom_field input_type is supported by this bin class
  # and adds an error if not

  def custom_field_type_supported
    unless self.class.supports_custom_field?(custom_field)
      errors.add(:custom_field, :unsupported_custom_field_type)
    end
  end
end
