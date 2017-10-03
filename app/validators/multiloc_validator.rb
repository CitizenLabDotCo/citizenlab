class MultilocValidator < ActiveModel::EachValidator

  def validate_each(record, attribute, value)

    if (options[:presence] && !value.kind_of?(Hash)) || (!options[:presence] && !(value.kind_of?(Hash) || value.nil?))
      record.errors[attribute] << (options[:message] || "is not a translation hash")
    elsif !value.nil?
      locales = I18n.available_locales.map(&:to_s)
      if !(value.keys - locales).empty?
        record.errors.add(attribute, :unsupported_locales, 
          message: (options[:message] || "contains unsupported locales #{(value.keys - locales)}"))
      elsif options[:presence] && value.values.all?(&:blank?)
        record.errors.add(attribute, :blank, 
          message: (options[:message] || "should be set for at least one locale"))
      end
    end
  end

end
