# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Configure parameters to be filtered from the log file. Use this to limit dissemination of
# sensitive information. See the ActiveSupport::ParameterFilter documentation for supported
# notations and behaviors.
Rails.application.config.filter_parameters += %i[
  password current_password passw secret token _key crypt salt certificate otp ssn import_ideas.pdf import_ideas.xlsx
]

# Filtering out base64 image encoding. -------------------------------------------------------------------------
#
# Filter only exact matches of specified parameter keys. This avoids filtering false positives.
# E.g. `image` will filter both `image` and `imageUrl`, whereas `^image$` will only filter `image`.
Rails.application.config.filter_parameters += [/^avatar$/, /^header_bg$/, /^image$/, /^layout_image$/, /^logo$/]

# Custom filter to remove base64 image encoding from multiloc values,
# as our WYSIWIG editors enable the addition of (multiple) images in the string value(s) of a mutliloc.
Rails.application.config.filter_parameters << lambda do |param, value|
  if CL2_SUPPORTED_LOCALES.include?(param.to_sym) && JSON.generate(value).include?(';base64,')
    value.gsub!(/;base64,[^ ]*/) { ';base64,[FILTERED]' }
  end
end
# ---------------------------------------------------------------------------------------------------------------
