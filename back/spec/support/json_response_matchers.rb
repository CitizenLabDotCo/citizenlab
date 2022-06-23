# frozen_string_literal: true

RSpec::Matchers.define :include_response_error do |attribute, error_key, options = nil|
  match do |response|
    matching_error = response.dig(:errors, attribute)&.find do |error|
      error[:error].to_s == error_key.to_s
    end
    return false unless matching_error

    !options || matching_error.except(:error) == options
  end
end
