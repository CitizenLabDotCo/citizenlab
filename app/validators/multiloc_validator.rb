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
      elsif options[:length]
        options[:length].each do |constraint, constraint_value|
          if constraint == :in
            if !value.values.select{ |v| v.size < constraint_value.first }.empty?
              record.errors.add(attribute, :too_short,
                message: (options[:too_short] || "is too short (minimum is #{constraint_value} characters)"))
            end
            if !value.values.select{ |v| v.size > constraint_value.last }.empty?
              record.errors.add(attribute, :too_long,
                message: (options[:too_long] || "is too long (maximum is #{constraint_value} characters)"))
            end
          elsif constraint == :is
            if !value.values.select{ |v| v.size != constraint_value }.empty?
              record.errors.add(attribute, :wrong_length,
                message: (options[:wrong_length] || "is the wrong length (should be #{constraint_value} characters)"))
            end
          elsif constraint == :maximum
            if !value.values.select{ |v| v.size > constraint_value }.empty?
              record.errors.add(attribute, :too_long,
                message: (options[:too_long] || "is too long (maximum is #{constraint_value} characters)"))
            end
          elsif constraint == :minimum
            if !value.values.select{ |v| v.size < constraint_value }.empty?
              record.errors.add(attribute, :too_short,
                message: (options[:too_short] || "is too short (minimum is #{constraint_value} characters)"))
            end
          end 
        end
      end
    end
  end

end
