# Be sure to restart your server when you modify this file.

# Configure parameters to be partially matched (e.g. passw matches password) and filtered from the log file.
# Use this to limit dissemination of sensitive information.
# See the ActiveSupport::ParameterFilter documentation for supported notations and behaviors.
Rails.application.config.filter_parameters += %i[
  passw secret token _key crypt salt certificate otp ssn import_ideas.pdf import_ideas.xlsx
]

# Filter out base64 encoding
#
# Filter only exact matches of specified parameter keys. This avoids filtering false positives.
# E.g. `image` will filter both `image` and `imageUrl`, whereas `^image$` will only filter `image`.
Rails.application.config.filter_parameters += [
  /^avatar$/,
  /^header_bg$/,
  /^image$/,
  /^layout_image$/,
  /^logo$/
]
# Custom filter that does 2 things:
#   1. Removes base64 image encoding from multiloc values, as our WYSIWYG editors enable the addition
#      of (multiple) images in the string value(s) of mutlilocs, which the FE encodes as base64.
#   2. Removes base64 encoding from the `file` parameter value, leaving other information intact (e.g. filename).
Rails.application.config.filter_parameters << lambda do |param, value|
  if param == 'file' || (
      CL2_SUPPORTED_LOCALES.include?(param.to_sym) && value.respond_to?(:include?) && value.include?(';base64,')
    )
    value.gsub!(/;base64,[^ ]*/) { ';base64,[FILTERED]' }
  end
end
