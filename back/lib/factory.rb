# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
  end

  def participation_method_for(project)
    method_class = case project.participation_method
    when 'ideation'
      ::ParticipationMethod::Ideation
    when 'budgeting'
      ::ParticipationMethod::Budgeting
    when 'native_survey'
      ::ParticipationMethod::NativeSurvey
    else
      raise "Unsupported participation method: #{project.participation_method}"
    end
    method_class.new(project)
  end

  private_class_method :new
end
