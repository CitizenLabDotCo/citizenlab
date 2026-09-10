# frozen_string_literal: true

module ContentBuilder
  module CustomBlocks
    # Static safety checks on block source, server side.
    #
    # A port of lint.ts in the block compiler, which runs the same rules in the
    # browser. Both exist because the source can arrive either way: from an admin's
    # editor, or from the background composer, which has no browser to lint in.
    # Change one and change the other; the rule names are the contract.
    #
    # This is a net for accidents and a steering signal for the model, not a
    # security boundary: same-realm code can evade source checks. The trust model
    # (feature flag, admin-only authoring) is the boundary.
    class SourceLinter
      Diagnostic = Data.define(:line, :rule, :message) do
        def to_s = "line #{line}: #{message} (#{rule})"
      end

      RULES = [
        ['no-eval', /\beval\s*\(|new\s+Function\s*\(/,
          'eval and new Function are not allowed in blocks.'],
        ['no-network', /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/,
          'Direct network access is not allowed. Use the gv-sdk data hooks (see data_uses).'],
        ['no-storage', /document\.cookie|localStorage|sessionStorage|indexedDB/,
          'Cookies and browser storage are not allowed in blocks.'],
        ['no-window-escape', /window\.(top|parent|open)\b/,
          'window.top, window.parent and window.open are not allowed.'],
        ['no-dynamic-import', /\bimport\s*\(/,
          'Dynamic import() is not allowed in blocks.'],
        ['no-raw-html', /dangerouslySetInnerHTML|createElement\(\s*['"]script['"]/,
          'Injecting raw HTML or script elements is not allowed.']
      ].freeze

      IMPORT_RE = /^\s*(?:import|export)\b[^'"]*['"]([^'"]+)['"]/
      ALLOWED_IMPORTS = ['gv-sdk'].freeze

      # @return [Array<Diagnostic>] empty when the source is clean.
      def self.lint(source)
        source.to_s.lines.flat_map.with_index(1) do |text, line|
          rule_diagnostics(text, line) + import_diagnostics(text, line)
        end
      end

      def self.rule_diagnostics(text, line)
        RULES.filter_map do |rule, pattern, message|
          Diagnostic.new(line: line, rule: rule, message: message) if pattern.match?(text)
        end
      end
      private_class_method :rule_diagnostics

      def self.import_diagnostics(text, line)
        match = IMPORT_RE.match(text)
        return [] if match.nil? || ALLOWED_IMPORTS.include?(match[1])

        [Diagnostic.new(
          line: line,
          rule: 'imports-whitelist',
          message: "Only 'gv-sdk' can be imported (found '#{match[1]}')."
        )]
      end
      private_class_method :import_diagnostics
    end
  end
end
