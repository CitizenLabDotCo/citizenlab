module Analysis
  module LLM
    class Gemini3Pro < RubyLLM
      # The model ID as returned by RubyLLM.models.chat_models
      def model
        'gemini-3-pro-preview'
      end

      def self.family
        'vertex_gemini'
      end

      def accuracy
        0.9
      end

      def chat_options
        {
          provider: 'vertexai',
          assume_model_exists: true
        }
      end

      def chat_context
        ::RubyLLM.context do |config|
          config.vertexai_project_id = ENV.fetch('VERTEXAI_PROJECT_ID', nil)
          config.vertexai_location = ENV.fetch('VERTEXAI_LOCATION', 'global')
        end
      end
    end
  end
end
