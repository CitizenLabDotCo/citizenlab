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

    # Outside development, a skill missing from the folder means the build didn't bring it.
    def self.find(name)
      return unless available?

      skill_file = ROOT.glob("*/skills/#{name}/SKILL.md").first
      return new(skill_file.dirname) if skill_file

      ErrorReporter.report_msg('LLM skill not found', extra: { name: }) unless Rails.env.development?
      nil
    end

    def initialize(dir)
      @dir = dir
    end

    def name
      @dir.basename.to_s
    end

    # The text of each file, by its path from the skill's folder, as SKILL.md refers to them.
    # SKILL.md comes first, without its front matter, which is only for Claude to find it.
    # Skills also refer to the shared files of their plugin.
    def files
      skill_file = @dir.join('SKILL.md')
      other_files = (@dir.glob('**/*.md') - [skill_file]).sort + @dir.parent.parent.glob('shared/**/*.md').sort

      {
        'SKILL.md' => skill_file.read.sub(FRONT_MATTER, ''),
        **other_files.to_h { |path| [path.relative_path_from(@dir).to_s, path.read] }
      }
    end
  end
end
