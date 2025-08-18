# frozen_string_literal: true

RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch('AZURE_OPENAI_API_KEY')
  config.openai_api_base = ENV.fetch('AZURE_OPENAI_URI')
end

# Patch RubyLLM to be able to use Azure OpenAI (instead of OpenAI).
# Native support for Azure OpenAI is planned for a future version.
# See https://github.com/crmne/ruby_llm/issues/15.
module RubyLLMPatch
  module Providers
    module OpenAI
      module Chat
        def completion_url(...)
          'openai/v1/chat/completions?api-version=preview'
        end
      end
    end
  end
end

RubyLLM::Providers::OpenAI::Chat.prepend(RubyLLMPatch::Providers::OpenAI::Chat)
