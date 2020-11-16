# frozen_string_literal: true

#
# Validates Boolean values
#
# ==== Usage
#
#     validates :some_attribute, boolean: true
#
class BooleanValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if [true, false, nil].include? value

    record.errors.add(
      attribute,
      :attribute_not_boolean,
      message: 'needs to be either true or false'
    )
  end
end
