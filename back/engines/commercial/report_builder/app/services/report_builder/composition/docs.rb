# frozen_string_literal: true

module ReportBuilder
  module Composition
    # The longer notes behind the read_docs tool: one markdown file per topic, next to
    # this file under docs/.
    #
    # Kept out of the system prompt on purpose. The prompt carries what every run
    # needs; these carry what one run in five needs, and a model that can ask for them
    # costs less than one that is handed everything every time.
    module Docs
      module_function

      DIR = Pathname.new(__dir__).join('docs')

      # @return [Array<String>] the topics on offer, sorted so the tool description is
      #   the same bytes on every request and stays cacheable.
      def topics
        DIR.glob('*.md').map { |path| path.basename('.md').to_s }.sort
      end

      # @return [String, nil] the notes on a topic, or nil when there is no such topic.
      def read(topic)
        name = topic.to_s.strip
        return nil unless topics.include?(name)

        DIR.join("#{name}.md").read
      end
    end
  end
end
