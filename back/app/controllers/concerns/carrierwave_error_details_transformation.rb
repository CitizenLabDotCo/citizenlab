# frozen_string_literal: true

module CarrierwaveErrorDetailsTransformation
  # @param [ActiveModel::Errors] errors
  # @param [Symbol] attribute_name
  def transform_carrierwave_error_details(errors, attribute_name)
    # @file.errors.details always returns { error: ActiveModel::Error#type }
    # But Carrierwave's ActiveModel::Error items sometimes have more specific messages in
    # ActiveModel::Error#options[:message] (e.g., max_size_error in this case).
    #
    # We want to use these specific messages on the FE.
    #
    # > @file.errors
    # => #<ActiveModel::Errors [
    #  #<ActiveModel::Error attribute=file, type=carrierwave_integrity_error, options={:message=>"max_size_error"}>,
    #  #<ActiveModel::Error attribute=file, type=blank, options={:unless=>#<Proc:0x0000558d8a77ac00 /citizenlab/back/app/models/project_file.rb:30>}>
    # ]>
    #
    # Taken from https://github.com/rails/rails/blob/d86b098a8a1/activemodel/lib/active_model/errors.rb#L276
    error_details = errors.group_by_attribute.transform_values do |attribute_errors|
      attribute_errors.map do |error|
        details = error.details
        # Here's how these Carrierwave messages are generated https://github.com/carrierwaveuploader/carrierwave/blob/f5b09b844d99245a3b4d0ba01efd4972be4ee5be/lib/carrierwave/uploader/file_size.rb#L36
        details[:error] = error.options[:message] || details[:error] if error.attribute == attribute_name
        details
      end
    end
    error_details[attribute_name] = error_details[attribute_name]&.uniq { |e| e[:error] }
    error_details
  end
end
