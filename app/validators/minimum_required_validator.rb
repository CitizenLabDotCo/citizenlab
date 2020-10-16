class MinimumRequiredValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless record.persisted?

    other_record_values = record.class.where.not(id: record.id).pluck(attribute)
    return if !required_values.include?(value.to_sym) || contains_required_values?(other_record_values)

    record.errors.add(attribute, :required, message: 'is required and cannot be changed or deleted.')
  end

  private

  def required_values
    options.dig(:values).map(&:to_sym)
  end

  def contains_required_values?(values)
    (required_values & values.map(&:to_sym)) == required_values
  end
end
