# frozen_string_literal: true

# Copenhagen KKI location API: derives a citizen's municipality code from their
# CPR number. Its configuration lives in the `nemlog_in` verification method
# (the `kki_*` config parameters); the API is considered enabled when a URI is set.
class CustomIdMethods::NemlogIn::KkiLocationApi
  def municipality_code(cpr_number)
    return if api_config[:kki_uri].blank?
    return if cpr_number.blank?

    response = HTTParty.get(
      api_config[:kki_uri] + cpr_number,
      headers: headers,
      basic_auth: { username: api_config[:kki_username], password: api_config[:kki_password] }
    )
    unless response.success?
      ErrorReporter.report_msg('Error in KKI Location API', extra: { status_code: response.code, cpr_number: cpr_number })
    end
    response['cprMunicipalityCode']
  end

  private

  def headers
    result = { 'Content-Type' => 'application/json' }

    # we'll definitely use it for test env, not sure about production
    if api_config[:kki_custom_headers].present?
      api_config[:kki_custom_headers].split(',').each do |header|
        header_name, header_value = header.split(':').map(&:strip)
        result[header_name] = header_value
      end
    end

    result
  end

  def api_config
    @api_config ||= ::Verification::VerificationService.new.method_by_name('nemlog_in')&.config || {}
  end
end
