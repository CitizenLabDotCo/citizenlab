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
    return unless [true, false].include? value

    record.errors.add(:base, attribute, message: 'Must be either true or false.')
  end
end
