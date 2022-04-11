RSpec::Matchers.define :include_response_error do |attribute, error_key|
  match do |response|
    response.dig(:errors, attribute)&.select { |error| error[:error].to_s == error_key.to_s }.present?
  end
end
