# frozen_string_literal: true

class IdNemlogIn::KkiLocationApi
  FEATURE_NAME = 'kki_location_api'

  def municipality_code(cpr_number)
    return unless app_config.feature_activated?(FEATURE_NAME)
    return if cpr_number.blank?

    response = HTTParty.get(
      api_config['uri'] + cpr_number,
      headers: headers,
      basic_auth: { username: api_config['username'], password: api_config['password'] }
    )
    response['cprMunicipalityCode']
  end

  private

  def headers
    result = { 'Content-Type' => 'application/json' }

    # we'll definitely use it for test env, not sure about production
    if api_config['custom_headers'].present?
      api_config['custom_headers'].split(',').each do |header|
        header_name, header_value = header.split(':').map(&:strip)
        result[header_name] = header_value
      end
    end

    result
  end

  def api_config
    app_config.settings[FEATURE_NAME]
  end

  def app_config
    @app_config ||= AppConfiguration.instance
  end
end
