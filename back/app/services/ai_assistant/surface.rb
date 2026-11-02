# frozen_string_literal: true

module AIAssistant
  # Where the assistant is used (e.g. the survey builder): which record it is about (the
  # subject), who may use it there, and its instructions.
  class Surface
    class UnknownKeyError < StandardError; end

    def self.all
      [Surfaces::SurveyBuilder]
    end

    def self.find!(key)
      all.find { |surface_class| surface_class.key == key } || raise(UnknownKeyError, "Unknown assistant surface: #{key}")
    end

    def self.for(conversation)
      find!(conversation.surface_key).new(conversation.subject)
    end

    def self.key
      raise NotImplementedError
    end

    def self.subject_class
      raise NotImplementedError
    end

    attr_reader :subject

    def initialize(subject)
      @subject = subject
    end

    def available?
      true
    end

    def accessible_by?(user)
      Pundit.policy!(user, subject).update?
    end

    def system_prompt(locale:)
      [
        ::Analysis::LLM::Prompt.new.fetch('ai_assistant_base', locale:),
        surface_prompt(locale:)
      ].join("\n\n")
    end

    private

    def surface_prompt(locale:)
      raise NotImplementedError
    end
  end
end
