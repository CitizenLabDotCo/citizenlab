# Helper class for generating documentation output that describes which
# validation errors can occur on models.

class ValidationErrorHelper

  ERROR_DETAILS = {
    ActiveModel::Validations::AcceptanceValidator => [:accepted],
    ActiveModel::Validations::AbsenceValidator => [:present],
    ActiveModel::Validations::ConfirmationValidator => [:confirmation],
    ActiveModel::Validations::ConfirmationValidator => [:exclusion],
    ActiveModel::Validations::FormatValidator => [:invalid],
    ActiveModel::Validations::InclusionValidator => [:inclusion],
    ActiveModel::Validations::LengthValidator => [:wrong_length, :too_short, :too_long],
    ActiveModel::Validations::NumericalityValidator => [:greater_than, :greater_than_or_equal_to, :equal_to, :less_than, :less_than_or_equal_to, :not_a_number, :not_an_integer, :equal_to, :odd, :even, :other_than],
    ActiveModel::Validations::PresenceValidator => [:blank],
    ActiveRecord::Validations::PresenceValidator => [:blank],
    ActiveRecord::Validations::UniquenessValidator => [:taken],
    ActiveRecord::Validations::LengthValidator => [:wrong_length, :too_short, :too_long],
    ActiveRecord::Validations::AssociatedValidator => [:invalid],
    ActiveRecord::Validations::AbsenceValidator => [:present],
    MultilocValidator => [:blank, :unsupported_locales],
    CarrierWave::Validations::ActiveModel::IntegrityValidator => [:integrity_error, :extension_whitelist_error, :extension_blacklist_error, :content_type_whitelist_error, :content_type_blacklist_error, :min_size_error, :max_size_error], 
    CarrierWave::Validations::ActiveModel::ProcessingValidator => [:processing_error], 
    CarrierWave::Validations::ActiveModel::DownloadValidator => [:download_error]
  }



  def model_error_codes model
    model.validators.flat_map do |validator| 
        validator.attributes.map{|a| [a, ERROR_DETAILS[validator.class]]}
      end
      .select(&:last)
      .to_h
      .map{|attribute, error_codes| [attribute, error_codes&.flatten&.compact&.uniq]}
      .to_h
  end

  def error_fields(rspec_context, model)
    model_error_codes(model).each do |attribute, error_codes|
      rspec_context.response_field attribute, "Array containing objects with signature {error: #{error_codes.map{|e| "'#{e}'"}.join(' | ')} }", scope: :errors
    end
  end
end
