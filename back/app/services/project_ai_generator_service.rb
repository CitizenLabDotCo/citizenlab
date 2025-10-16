# frozen_string_literal: true

class ProjectAIGeneratorService
  class AiGenerationError < StandardError; end

  def initialize(description, user)
    @description = description
    @user = user
    @llm = Analysis::LLM::GPT4o.new
  end

  def generate_project_attributes
    prompt = build_prompt(@description)
    
    Rails.logger.info "Generating AI project with prompt length: #{prompt.length}"
    
    response = @llm.chat(prompt)
    
    if response.blank?
      Rails.logger.error "AI service returned blank response"
      raise AiGenerationError, 'AI service failed to generate a response. Please try again.'
    end

    Rails.logger.info "AI response received: #{response[0..200]}..." if response.length > 200

    parsed_response = parse_ai_response(response)
    validate_ai_response(parsed_response)
    build_project_attributes(parsed_response)
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse AI response: #{e.message}\nResponse: #{response}"
    raise AiGenerationError, 'AI generated an invalid response format. Please try again.'
  rescue AiGenerationError
    raise
  rescue StandardError => e
    Rails.logger.error "AI project generation failed: #{e.class} - #{e.message}"
    raise AiGenerationError, 'Failed to generate project with AI. Please try again or use manual mode.'
  end

  private

  def build_prompt(description)
    all_locales = AppConfiguration.instance.settings('core', 'locales')
    Analysis::LLM::Prompt.new.fetch('project_generation', description: description, all_locales: all_locales)
  end

  def parse_ai_response(response)
    # Clean up the response to extract JSON
    json_match = response.match(/\{.*\}/m)
    json_string = json_match ? json_match[0] : response
    
    JSON.parse(json_string)
  end

  def validate_ai_response(parsed_response)
    unless parsed_response.is_a?(Hash)
      raise AiGenerationError, 'AI response is not a valid object'
    end

    required_keys = %w[title_multiloc description_multiloc]
    missing_keys = required_keys - parsed_response.keys
    
    if missing_keys.any?
      raise AiGenerationError, "AI response missing required fields: #{missing_keys.join(', ')}"
    end

    # Validate that multiloc objects have at least one locale
    %w[title_multiloc description_multiloc].each do |key|
      multiloc = parsed_response[key]
      unless multiloc.is_a?(Hash) && multiloc.any?
        raise AiGenerationError, "AI response has invalid #{key} format"
      end
    end
  end

  def build_project_attributes(parsed_response)
    # Get the base attributes that would be permitted for project creation
    project_attributes = {
      title_multiloc: parsed_response['title_multiloc'],
      description_multiloc: parsed_response['description_multiloc'],
      visible_to: 'public', # Default to public visibility
      admin_publication_attributes: {
        publication_status: 'draft' # Start as draft so user can review
      }
    }

    # Note: Not setting folder here - let the regular project creation flow handle folder assignment

    project_attributes
  end
end