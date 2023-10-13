# frozen_string_literal: true

Mjml.setup do |config|
  # Use custom MJML binary with custom version.
  # This slightly reduces the time to initialize Rails
  # as mjml-rails doesn't need to search for the binary.
  config.mjml_binary = '/usr/local/bin/mjml'
end
