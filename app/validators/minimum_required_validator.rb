class MinimumRequiredValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if !required_values.include?(value.to_sym) ||
              include_required_values?(record.class.pluck(attribute))

    record.errors.add(:required, attribute, message: 'Cannot delete a required value.')
  end

  private

  def required_values
    options.dig(:values).map(&:to_sym)
  end

  def include_required_values?(*values)
    (required_values & values.map(&:to_sym)) == required_values
  end
end
