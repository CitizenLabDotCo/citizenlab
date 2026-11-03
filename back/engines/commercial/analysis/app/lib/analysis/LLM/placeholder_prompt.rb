# frozen_string_literal: true

module Analysis
  module LLM
    # Renders a prompt template that comes from tenant settings, i.e. content we
    # do not control. Only `%{placeholder}` substitution is supported: the
    # template is never evaluated, so it cannot run code, read the environment or
    # reach the database.
    #
    # Templates that live in config/prompts go through LLM::Prompt instead: those
    # are part of the codebase and may use the full ERB syntax.
    class PlaceholderPrompt
      PLACEHOLDER_PATTERN = /%\{(\w+)\}/

      # @param template [String] e.g. "Project: %{project_title}"
      # @param values [Hash<Symbol, Object>] the values allowed to be substituted.
      #   Placeholders that are not among them are left untouched, so a typo in a
      #   tenant's template degrades the prompt instead of breaking the analysis.
      # @return [String]
      def render(template, **values)
        allowed = values.transform_keys(&:to_s)

        # The block form of gsub inserts the return value literally: neither
        # backslash sequences (\1, \\) nor placeholders contained in a value are
        # interpreted, so a value can never inject a placeholder of its own.
        template.gsub(PLACEHOLDER_PATTERN) do
          key = Regexp.last_match(1)
          allowed.key?(key) ? allowed[key].to_s : Regexp.last_match(0)
        end
      end
    end
  end
end
