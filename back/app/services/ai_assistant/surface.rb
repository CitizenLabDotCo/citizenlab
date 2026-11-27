# frozen_string_literal: true

module AIAssistant
  # Where the assistant is used (e.g. the survey builder): which record it is about (the
  # subject), who may use it there, its instructions, and the tools it may call.
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

    # The skill (see Skill) whose guidance goes into the instructions here, if any.
    def self.skill_name
      nil
    end

    # The files of that skill that go into the instructions.
    def self.skill_files
      []
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

    def project_id
      subject.try(:project_id)
    end

    def tools
      raise NotImplementedError
    end

    def tool(name)
      tools.find { |tool| tool.name == name }
    end

    def stale?(_tool_call)
      false
    end

    # Why the model can't make this write call yet, or nil. The error goes back to the model.
    def write_call_error(_tool, _conversation)
      nil
    end

    def system_prompt(locale:)
      [
        ::Analysis::LLM::Prompt.new.fetch('ai_assistant_base', locale:),
        surface_prompt(locale:),
        skill_prompt
      ].compact.join("\n\n")
    end

    private

    def skill
      return @skill if defined?(@skill)

      @skill = (Skill.find(self.class.skill_name, self.class.skill_files) if self.class.skill_name)
    end

    def skill_prompt
      skill&.prompt
    end

    def surface_prompt(locale:)
      raise NotImplementedError
    end
  end
end
