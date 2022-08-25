# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
  end

  def participation_method_for(project)
    participation_context = ::ParticipationContextService.new.get_participation_context(project)
    return ::ParticipationMethod::Ideation.new(project) unless participation_context

    participation_method = participation_context.participation_method
    method_class = case participation_method
    # when 'ideation'
    #   ::ParticipationMethod::Ideation
    when 'budgeting'
      ::ParticipationMethod::Budgeting
    when 'native_survey'
      ::ParticipationMethod::NativeSurvey
    else # TODO: Introduce participation method for every participation_method
      ::ParticipationMethod::Ideation
    end
    method_class.new(project)
  end

  private_class_method :new
end
