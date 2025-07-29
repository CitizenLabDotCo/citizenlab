# frozen_string_literal: true

module Files
  # Background job for generating AI-powered file descriptions.
  class DescriptionGenerationJob < ApplicationJob
    # Set priority to 45 (slightly more important than emails at 50)
    # This matches the priority used by other analysis jobs in the system
    self.priority = 45

    # @param file [Files::File] The file to generate descriptions for
    def perform(file)
      Files::DescriptionGenerator.new.generate_descriptions!(file)
    end

    private

    def handle_error
      (raise NotImplementedError)
    end
  end
end
