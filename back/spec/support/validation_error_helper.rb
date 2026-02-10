# frozen_string_literal: true

# Helper class for generating documentation output that describes which
# validation errors can occur on models.
class ValidationErrorHelper
  ERROR_DETAILS = {
    ActiveModel::Validations::AbsenceValidator => [:present],
    ActiveModel::Validations::AcceptanceValidator => [:accepted],
    ActiveModel::Validations::ConfirmationValidator => [:confirmation],
    ActiveModel::Validations::ExclusionValidator => [:exclusion],
    ActiveModel::Validations::FormatValidator => [:invalid],
    ActiveModel::Validations::InclusionValidator => [:inclusion],
    ActiveModel::Validations::LengthValidator => %i[wrong_length too_short too_long],
    ActiveModel::Validations::NumericalityValidator => %i[greater_than greater_than_or_equal_to equal_to less_than less_than_or_equal_to not_a_number not_an_integer equal_to odd even other_than],
    ActiveModel::Validations::PresenceValidator => [:blank],
    ActiveRecord::Validations::AbsenceValidator => [:present],
    ActiveRecord::Validations::AssociatedValidator => [:invalid],
    ActiveRecord::Validations::LengthValidator => %i[wrong_length too_short too_long],
    ActiveRecord::Validations::PresenceValidator => [:blank],
    ActiveRecord::Validations::UniquenessValidator => [:taken],
    CarrierWave::Validations::ActiveModel::DownloadValidator => [:download_error],
    CarrierWave::Validations::ActiveModel::IntegrityValidator => %i[integrity_error extension_whitelist_error extension_blacklist_error content_type_whitelist_error content_type_blacklist_error min_size_error max_size_error],
    CarrierWave::Validations::ActiveModel::ProcessingValidator => [:processing_error],
    JsonValidator => [:invalid_json], # not sure
    MultilocValidator => %i[blank unsupported_locales too_long too_short wrong_length values_not_all_strings]
  }

  def model_error_codes(model)
    attrs_errs = model.validators.flat_map do |validator|
      validator.attributes.map { |a| [a, ERROR_DETAILS[validator.class]] }
    end.select(&:last)
    to_h_appended(attrs_errs)
      .transform_values { |error_codes| error_codes&.flatten&.compact&.uniq }
  end

  def to_h_appended(arr)
    # kind of similar as .to_h but taking care
    # of multiple occurances of the same key
    # all values with the same key are put in a list
    h = {}
    arr.each do |elt|
      k = elt.first
      v = elt.drop(1)
      h[k] = (h[k] || []).append v
    end
    h
  end

  def error_fields(rspec_context, model)
    model_error_codes(model).each do |attribute, error_codes|
      rspec_context.response_field attribute, "Array containing objects with signature { error: #{error_codes.map { |e| "'#{e}'" }.join(' | ')} }", scope: :errors
    end
  end
end
