# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Language < AutoTaggingMethod::Base
    TAG_TYPE = 'language'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      total_inputs = filtered_inputs.size

      filtered_inputs.includes(:author).each_with_index do |input, i|
        update_progress(i / total_inputs.to_f) if i % 5 == 0

        text = input_to_text.execute(input).values.join("\n")
        next if text.strip.empty?

        language = language_for_text(text)
        next if !language

        tag = find_or_create_tag(language)
        find_or_create_tagging!(input_id: input.id, tag_id: tag.id)
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    def language_for_text(input_text)
      prompt = LLM::Prompt.new.fetch('language_detection', input_text:)
      lang = gpt4mini.chat(prompt).strip
      lang if lang.size == 2
    end

    def find_or_create_tag(language)
      tags_by_name[language] ||= Tag.find_or_create_by!(name: language, tag_type: TAG_TYPE, analysis: analysis)
    end

    def tags_by_name
      @tags_by_name ||= analysis.tags.where(tag_type: TAG_TYPE).all.index_by(&:name)
    end
  end
end
