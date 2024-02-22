# frozen_string_literal: true

module Analysis
  class TopicModelingService
    def initialize
      @llm = Analysis::LLM::GPT4Turbo.new
    end

    def extract_topics(project_title, inputs_texts)
      max_topics = 10 # TODO
      parse_response(run_prompt(project_title, inputs_texts, max_topics))
    end

    private

    def run_prompt(project_title, inputs_texts, max_topics)
      prompt = Analysis::LLM::Prompt.new.fetch('topic_modeling', project_title: project_title, inputs_texts: inputs_texts, max_topics: max_topics)
      @llm.chat(prompt).strip
    end

    def parse_response(response)
      response.split("\n")
    end
  end
end
