# frozen_string_literal: true

# Service to select the most appropriate and permitted LLM for a given task
class LLMSelector
  LLMFamily = Struct.new('LLMFamily', :key, :name, :description, keyword_init: true)
  LLMUseCase = Struct.new('LLMUseCase', :key, :description, :supported_models, :default_model, keyword_init: true)

  FAMILIES = [
    LLMFamily.new(
      key: 'vertex_gemini',
      name: 'Google Gemini (Vertex AI)',
      description: 'Google Gemini models via Vertex AI'
    ),
    LLMFamily.new(
      key: 'azure_openai',
      name: 'Azure OpenAI',
      description: 'OpenAI models via Microsoft Azure OpenAI Service'
    ),
    LLMFamily.new(
      key: 'aws_anthropic',
      name: 'AWS Bedrock Anthropic Claude',
      description: 'Anthropic Claude models via AWS Bedrock'
    )
  ]

  MODELS = [
    ::Analysis::LLM::GPT4oMini,
    ::Analysis::LLM::GPT4o,
    ::Analysis::LLM::GPT41,
    ::Analysis::LLM::ClaudeHaiku45,
    ::Analysis::LLM::ClaudeSonnet45,
    ::Analysis::LLM::ClaudeOpus45,
    ::Analysis::LLM::Gemini25Pro,
    ::Analysis::LLM::Gemini25Flash
  ]

  USE_CASES = [
    LLMUseCase.new(
      key: 'sensemaking_auto_tagging',
      description: 'Automatic tagging of content in sensemaking',
      supported_models: [::Analysis::LLM::GPT4oMini, ::Analysis::LLM::ClaudeHaiku45, ::Analysis::LLM::Gemini25Flash],
      default_model: ::Analysis::LLM::GPT4oMini
    ),
    LLMUseCase.new(
      key: 'sensemaking_summarization',
      description: 'Summarization of content in sensemaking',
      supported_models: [::Analysis::LLM::GPT41, ::Analysis::LLM::Gemini25Pro, ::Analysis::LLM::ClaudeOpus45],
      default_model: ::Analysis::LLM::GPT41
    ),
    LLMUseCase.new(
      key: 'toxicity_detection',
      description: 'Detection of toxic content',
      supported_models: [::Analysis::LLM::ClaudeHaiku45, ::Analysis::LLM::GPT4oMini, ::Analysis::LLM::Gemini25Flash],
      default_model: ::Analysis::LLM::ClaudeHaiku45
    ),
    LLMUseCase.new(
      key: '360_input_file_description',
      description: 'Generating descriptions for 360 input files',
      supported_models: [::Analysis::LLM::GPT4o, ::Analysis::LLM::ClaudeSonnet45, ::Analysis::LLM::Gemini25Pro],
      default_model: ::Analysis::LLM::GPT4o
    ),
    LLMUseCase.new(
      key: 'idea_feed_live_topic_model',
      description: 'Automatically manage the tags in the Idea Feed constantly.',
      supported_models: [::Analysis::LLM::ClaudeOpus45, ::Analysis::LLM::Gemini25Pro],
      default_model: ::Analysis::LLM::Gemini25Pro
    ),
    LLMUseCase.new(
      key: 'idea_feed_live_classification',
      description: 'Classify ideas into existing topics in the Idea Feed constantly.',
      supported_models: [::Analysis::LLM::ClaudeHaiku45, ::Analysis::LLM::Gemini25Flash],
      default_model: ::Analysis::LLM::Gemini25Flash
    )
  ]

  def llm_claz_for_use_case(use_case_key, app_configuration = AppConfiguration.instance)
    use_case = use_cases.find { |uc| uc.key == use_case_key }
    raise ArgumentError, "Use case not found: #{use_case_key}" unless use_case

    family = configured_family_for_use_case(use_case, app_configuration)

    return use_case.default_model if family.nil?

    selected_model = use_case.supported_models.find { |model_claz| model_claz.new.family == family.key }
    raise "Configured family #{family.key} for use case #{use_case.key} has no supported models" unless selected_model

    selected_model
  end

  # Clean the app_configuration settings for ai_providers by removing any
  # use cases or families that are not, or no longer in the defined FAMILIES constant.
  def clean_ai_providers!(app_configuration)
    ai_providers_config = app_configuration.settings('core', 'ai_providers')
    return if ai_providers_config.blank?

    valid_use_case_keys = use_cases.map(&:key)
    valid_family_keys = families.map(&:key)

    ai_providers_config.each_key do |use_case_key|
      if valid_use_case_keys.exclude?(use_case_key)
        ai_providers_config.delete(use_case_key)
      elsif valid_family_keys.exclude?(ai_providers_config[use_case_key])
        ai_providers_config[use_case_key] = 'auto'
      end
    end

    app_configuration
  end

  def use_cases
    USE_CASES
  end

  def families
    FAMILIES
  end

  def models
    MODELS
  end

  def families_for_use_case(use_case)
    family_keys = use_case.supported_models.filter_map do |model_claz|
      model_claz.new.family
    end.uniq

    families.select { |family| family_keys.include?(family.key) }
  end

  private

  def configured_family_for_use_case(use_case, app_configuration)
    ai_providers_config = app_configuration.settings('core', 'ai_providers')
    ai_providers_config&.dig(use_case.key)
  end
end
