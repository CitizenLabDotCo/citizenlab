# frozen_string_literal: true

module AIAssistant
  # Where the assistant is used (e.g. the survey builder of a phase): which record it is
  # about, who may use it there, its instructions, and the tools it may call.
  class Context
    def self.all
      [Contexts::SurveyBuilder]
    end

    def self.find!(key)
      all.find { |context_class| context_class.key == key } || raise(KeyError, "Unknown assistant context: #{key}")
    end

    def self.for(conversation)
      find!(conversation.context_key).new(conversation.context)
    end

    def self.key
      raise NotImplementedError
    end

    def self.record_class
      raise NotImplementedError
    end

    attr_reader :record

    def initialize(record)
      @record = record
    end

    def available?
      true
    end

    def accessible_by?(user)
      Pundit.policy!(user, record).update?
    end

    def project_id
      record.try(:project_id)
    end

    def tools
      raise NotImplementedError
    end

    def tool(name)
      tools.find { |tool| tool.name == name }
    end

    def system_prompt(locale:)
      [
        ::Analysis::LLM::Prompt.new.fetch('ai_assistant_base', locale:),
        context_prompt(locale:)
      ].join("\n\n")
    end

    private

    def context_prompt(locale:)
      raise NotImplementedError
    end
  end
end
