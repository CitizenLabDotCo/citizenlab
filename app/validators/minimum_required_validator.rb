# frozen_string_literal: true

#
# ===== Purpose
#
#     Adds errors to an object if a set of required values don't exist in the DB.
#
#
# ===== Usage
#
#     validates :some_field, minimum_required: { values: [value_1, value_2] }
#
class MinimumRequiredValidator < ActiveModel::EachValidator
  def validate_each(*args)
    @record, @attribute, @value = args

    return unless updating_required_value? || destroying_required_object?

    record.errors.add(attribute, :value_required, message: 'is required and cannot be changed or deleted.')
  end

  private

  attr_reader :record, :attribute, :value
  delegate :persisted?, :changes, :class, to: :record, prefix: true

  def updating_required_value?
    record_persisted? && required_attribute_will_change?
  end

  def destroying_required_object?
    record.will_be_destroyed? && attribute_value_required?
  end

  def required_attribute_will_change?
    return unless attribute_value_required?

    record_changes.key?(attribute.to_s)
  end

  def attribute_value_required?
    value_in_required_list? && !other_records_contain_required_values?
  end

  def value_in_required_list?
    required_values.include?(value.to_sym)
  end

  def values_of_other_records
    record_class.where.not(id: record.id).pluck(attribute)
  end

  def other_records_contain_required_values?
    (required_values & values_of_other_records.map(&:to_sym)) == required_values
  end

  def required_values
    options.dig(:values).map(&:to_sym)
  end
end
