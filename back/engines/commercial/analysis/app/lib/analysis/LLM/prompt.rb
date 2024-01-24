# frozen_string_literal: true

module Analysis
  module LLM
    class Prompt
      def fetch(filename, **args)
        b = OpenStruct.new(args).instance_eval { binding } # Convert hash to binding
        prompt_filepath = Rails.root.join("engines/commercial/analysis/config/prompts/#{filename}.erb")
        ERB.new(File.read(prompt_filepath)).result(b)
      end
    end
  end
end
