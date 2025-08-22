# frozen_string_literal: true

RubyLLM.configure do |config|
  config.bedrock_secret_key = ENV.fetch('AWS_SECRET_ACCESS_KEY', nil)
  config.bedrock_api_key = ENV.fetch('AWS_ACCESS_KEY_ID', nil)
  config.bedrock_region = ENV.fetch('AWS_REGION', nil)
end

module RubyLLM
  module Providers
    class Bedrock
      module Models
        # With Bedrock, some models are only available in certain regions through
        # cross-region inference. Depending on the region, the model ID may need to be
        # prefixed with the region code, or not at all. RubyLLM currently assumes that
        # if cross-region access is needed, the prefix should be "us". This patch adds
        # support for other prefixes as well.
        def model_id_with_region(model_id, model_data)
          return model_id unless model_data['inferenceTypesSupported']&.include?('INFERENCE_PROFILE')
          return model_id if model_data['inferenceTypesSupported']&.include?('ON_DEMAND')

          region_prefix = config.bedrock_region.split('-').first
          if region_prefix.in? %w[eu ap us]
            "#{region_prefix}.#{model_id}"
          else
            raise ArgumentError, "Unsupported region prefix: #{region_prefix}. Expected 'eu', 'ap', or 'us'."
          end
        end
      end
    end
  end
end

# The model refresh can fail if the remote service is unavailable. We had to choose
# between preventing the app from starting or starting without refreshing the models,
# which could likely cause errors in the services using RubyLLM. We chose the latter.
begin
  RubyLLM.models.refresh!
rescue StandardError => e
  ErrorReporter.report(e)
end
