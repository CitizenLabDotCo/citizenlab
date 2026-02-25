# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileClaudeParser < IdeaPdfFileGPTParser
    def parse_rows(file)
      claude_service = BulkImportIdeas::Parsers::Pdf::GPTFormParser.new(@phase, @locale, llm_class: Analysis::LLM::ClaudeSonnet45)
      form_parsed_idea = claude_service.parse_idea(file.file, template_data[:page_count])

      file.update!(parsed_value: { parser: 'claude', value: form_parsed_idea })

      [idea_to_idea_row(form_parsed_idea, file)]
    end
  end
end
