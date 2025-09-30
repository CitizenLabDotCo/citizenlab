# frozen_string_literal: true

RubyLLM.configure do |config|
  config.bedrock_secret_key = ENV.fetch('AWS_SECRET_ACCESS_KEY', nil)
  config.bedrock_api_key = ENV.fetch('AWS_ACCESS_KEY_ID', nil)
  config.bedrock_region = ENV.fetch('AWS_TOXICITY_DETECTION_REGION', nil)
end

# The model refresh can fail if the remote service is unavailable. We had to choose
# between preventing the app from starting or starting without refreshing the models,
# which could likely cause errors in the services using RubyLLM. We chose the latter.
begin
  RubyLLM.models.refresh!
rescue StandardError => e
  require 'error_reporter'
  ErrorReporter.report(e)
end
