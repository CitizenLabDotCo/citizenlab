# frozen_string_literal: true

class JsonValidator < ActiveModel::EachValidator
  DEFAULT_OPTIONS = {
    errors_as_objects: true
  }

  def validate_each(record, attr, value)
    errors = ::JSON::Validator.fully_validate(
      schema,
      value,
      DEFAULT_OPTIONS.merge(options[:options] || {})
    )

    return if errors.empty?

    errors.each do |e|
      record.errors.add(
        attr,
        { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] },
        value: value
      )
    end
  end

  private

  def schema
    if options[:schema].is_a?(Proc)
      options[:schema].call
    else
      options[:schema]
    end
  end
end
