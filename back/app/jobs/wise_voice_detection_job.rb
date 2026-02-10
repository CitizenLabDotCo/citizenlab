# frozen_string_literal: true

class WiseVoiceDetectionJob < ApplicationJob
  queue_as :default

  def run(flaggable)
    existing_flag = flaggable.wise_voice_flag

    raw_response = llm.chat(prompt(flaggable))

    response = JSON.parse(raw_response)

    WiseVoiceFlag.transaction do
      existing_flag&.destroy!
      if response['has_wise_voice']
        WiseVoiceFlag.create!(
          flaggable:,
          role_multiloc: response['role_multiloc'],
          quotes: response['quotes']
        )
      end
    end
  rescue JSON::ParserError => e
    Rails.logger.error("WiseVoiceDetectionJob: JSON parsing error - #{e.message}")
  end

  private

  def prompt(flaggable)
    project_title = MultilocService.new.t(flaggable.project.title_multiloc)
    flaggable_title = MultilocService.new.t(flaggable.title_multiloc) if flaggable.respond_to?(:title_multiloc)
    flaggable_body = MultilocService.new.t(flaggable.body_multiloc)

    Analysis::LLM::Prompt.new.fetch('wise_voice_detection', flaggable:, project_title:, flaggable_title:, flaggable_body:, tenant_locales:)
  end

  def tenant_locales
    @tenant_locales ||= AppConfiguration.instance.settings('core', 'locales')
  end

  def llm
    Analysis::LLM::GPT41.new
  end
end
