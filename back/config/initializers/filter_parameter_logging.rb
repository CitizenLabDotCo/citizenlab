# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Configure parameters to be filtered from the log file. Use this to limit dissemination of
# sensitive information. See the ActiveSupport::ParameterFilter documentation for supported
# notations and behaviors.
Rails.application.config.filter_parameters += %i[
  password current_password passw secret token _key crypt salt certificate otp ssn import_ideas.pdf import_ideas.xlsx
]

# Filter only exact matches of specified parameter keys. This avoids filtering false positives.
# E.g. `image` will filter both `image` and `imageUrl`, whereas `^image$` will only filter `image`.
Rails.application.config.filter_parameters += [/^image$/]
