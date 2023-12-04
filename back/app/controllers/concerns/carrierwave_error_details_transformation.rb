# frozen_string_literal: true

module CarrierwaveErrorDetailsTransformation
  # @param [ActiveModel::Errors] errors
  # @param [Symbol] errors
  def transform_carrierwave_error_details(errors, attribute_name)
    # @file.errors.details always returns { error: ActiveModel::Error#type }
    # But Carrierwave's ActiveModel::Error items sometimes have more specific messages (e.g., max_size_error in this case).
    # We want to use these specific messages on the FE.
    #
    # > @file.errors
    # => #<ActiveModel::Errors [
    #  #<ActiveModel::Error attribute=file, type=carrierwave_integrity_error, options={:message=>"max_size_error"}>,
    #  #<ActiveModel::Error attribute=file, type=blank, options={:unless=>#<Proc:0x0000558d8a77ac00 /cl2_back/app/models/project_file.rb:30>}>
    # ]>
    #
    # Taken from https://github.com/rails/rails/blob/d86b098a8a1/activemodel/lib/active_model/errors.rb#L276
    error_details = errors.group_by_attribute.transform_values do |attribute_errors|
      attribute_errors.map do |error|
        details = error.details
        details[:error] = error.options[:message] || error.type
        details
      end
    end
    error_details[attribute_name] = error_details[attribute_name]&.uniq { |e| e[:error] }
    error_details
  end
end
