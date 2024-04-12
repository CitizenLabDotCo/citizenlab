# frozen_string_literal: true

module Analysis
  module LLM
    class Prompt
      def fetch(filename, **args)
        prompt_filepath = Rails.root.join("engines/commercial/analysis/config/prompts/#{filename}.erb")
        ERB.new(File.read(prompt_filepath)).result_with_hash(args)
      end
    end
  end
end
