class PhoneService

  def phone_or_email str
    if str =~ /^.*@.*..*$/
      :email
    elsif normalize_phone(str).size > 5 && (str =~ /^\+?[0-9\.x\-\s\(\)]+$/)
      :phone
    else
      nil
    end
  end

  def encoded_phone_or_email?(str)
    return :email unless phone_sign_in_activated?

    prefix, suffix = phone_to_email_pattern.split('__PHONE__')
    return :phone if str.starts_with?(prefix) && str.ends_with?(suffix)

    :email
  end

  #
  # <Checks if a string is in phone or email format, and if it's a phone, converts it to a an email format>
  #
  # @example When `str` is an email
  #   "email@email.com" #=> "email@email.com"
  #
  # @example When `str` is a phone number and `phone_email_pattern` is "phone+__PHONE__@test.com"
  #   "65765747565" #=> "<phone+65765747565@test.com>"
  #
  # @param [<String>] str <An email or phone>
  #
  # @return [<string>] <The original string or a phone number coverted to email format>
  #
  def emailize_email_or_phone(str)
    return str unless phone_sign_in_activated? && phone_or_email(str) == :phone

    phone_to_email_pattern.gsub('__PHONE__', normalize_phone(str))
  end

  def normalize_phone str
    str.tr('^0-9', '')
  end

  def phone_to_email_pattern
    app_config.settings('password_login', 'phone_email_pattern')
  end

  def phone_sign_in_activated?
    app_config.feature_activated?('password_login') &&
    app_config.settings('password_login','phone') &&
    app_config.settings('password_login', 'phone_email_pattern').present?
  end

  def app_config
    @app_config ||= AppConfiguration.instance
  end
end
