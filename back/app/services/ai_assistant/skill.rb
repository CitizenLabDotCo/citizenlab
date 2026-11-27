# frozen_string_literal: true

module AIAssistant
  # A skill from the team's skills repo: guidance written for Claude, which a surface adds to
  # the model's instructions. bin/setup-llm-skills copies the skills listed in
  # config/llm_skills.yml into vendor/llm_skills, in development and in CI.
  class Skill
    ROOT = Rails.root.join(Rails.env.test? ? 'spec/fixtures/llm_skills/plugins' : 'vendor/llm_skills/plugins')
    FRONT_MATTER = /\A---\n.*?\n---\n+/m

    def self.available?
      ROOT.directory?
    end

    # +paths+ are the files of the skill that go into the prompt, from the skill's folder, as
    # SKILL.md refers to them. Outside development, a skill missing from the folder means the
    # build didn't bring it.
    def self.find(name, paths)
      return unless available?

      skill_file = ROOT.glob("*/skills/#{name}/SKILL.md").first
      return new(skill_file.dirname, paths) if skill_file

      ErrorReporter.report_msg('LLM skill not found', extra: { name: }) unless Rails.env.local?
      nil
    end

    def initialize(dir, paths)
      @dir = dir
      @paths = paths
    end

    def prompt
      ::Analysis::LLM::Prompt.new.fetch('ai_assistant_skill', skill: self)
    end

    def name
      @dir.basename.to_s
    end

    # The text of each listed file, by its path. SKILL.md loses its front matter, which is only
    # for Claude to find the skill.
    def files
      @files ||= @paths.each_with_object({}) do |path, files|
        file = @dir.join(path)
        if file.file?
          files[path] = path == 'SKILL.md' ? file.read.sub(FRONT_MATTER, '') : file.read
        else
          ErrorReporter.report_msg('LLM skill file not found', extra: { name:, path: }) unless Rails.env.local?
        end
      end
    end
  end
end
