# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
  end

  def participation_method_for(project)
    participation_context = ::ParticipationContextService.new.get_participation_context(project)
    return ::ParticipationMethod::None.new unless participation_context

    participation_method = participation_context.participation_method
    method_class = case participation_method
    when 'ideation'
      ::ParticipationMethod::Ideation
    when 'budgeting'
      ::ParticipationMethod::Budgeting
    when 'native_survey'
      ::ParticipationMethod::NativeSurvey
    else
      raise "Unsupported participation method: #{participation_method}"
    end
    method_class.new(project)
  end

  def json_schema_generator_class_for(resource_type)
    case resource_type
    when 'CustomForm'
      InputJsonSchemaGeneratorService
    when 'User'
      UserJsonSchemaGeneratorService
    else
      raise "Unsupported resource type: #{resource_type}"
    end
  end

  def ui_schema_generator_class_for(resource_type)
    case resource_type
    when 'CustomForm'
      InputUiSchemaGeneratorService
    when 'User'
      UserUiSchemaGeneratorService
    else
      raise "Unsupported resource type: #{resource_type}"
    end
  end

  private_class_method :new
end
