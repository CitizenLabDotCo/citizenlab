class MultilocValidator < ActiveModel::EachValidator

  def validate_each(record, attribute, value)

    if !value.kind_of? Hash
      record.errors[attribute] << (options[:message] || "is not a translation hash")
    else
      locales = Tenant.settings 'core', 'locales'
      if !(value.keys - locales).empty?
        record.errors[attribute] << (options[:message] || "contains unsupported locales #{(value.keys - locales)}")
      elsif options.presence && value.values.all?(&:blank?)
        record.errors[attribute] << (options[:message] || "should be set for at least one locale")
      end
    end
  end

end
