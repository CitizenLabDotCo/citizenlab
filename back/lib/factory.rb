# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
  end

  def participation_method_for(participation_context)
    case participation_context&.participation_method
    when 'information'
      ::ParticipationMethod::Information.new(participation_context)
    when 'ideation'
      ::ParticipationMethod::Ideation.new(participation_context)
    when 'document_annotation'
      ::ParticipationMethod::DocumentAnnotation.new(participation_context)
    when 'survey'
      ::ParticipationMethod::Survey.new(participation_context)
    when 'budgeting'
      ::ParticipationMethod::Budgeting.new(participation_context)
    when 'poll'
      ::ParticipationMethod::Poll.new(participation_context)
    when 'volunteering'
      ::ParticipationMethod::Volunteering.new(participation_context)
    when 'native_survey'
      ::ParticipationMethod::NativeSurvey.new(participation_context)
    else
      ::ParticipationMethod::None.new
    end
  end

  private_class_method :new
end
