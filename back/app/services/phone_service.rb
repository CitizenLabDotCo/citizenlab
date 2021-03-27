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

  def normalize_phone str
    str.tr('^0-9', '')
  end
end
