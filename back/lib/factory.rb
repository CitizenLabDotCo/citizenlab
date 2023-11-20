# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
  end

  def participation_method_for(phase)
    case phase&.participation_method
    when 'information'
      ::ParticipationMethod::Information.new(phase)
    when 'ideation'
      ::ParticipationMethod::Ideation.new(phase)
    when 'document_annotation'
      ::ParticipationMethod::DocumentAnnotation.new(phase)
    when 'survey'
      ::ParticipationMethod::Survey.new(phase)
    when 'voting'
      ::ParticipationMethod::Voting.new(phase)
    when 'poll'
      ::ParticipationMethod::Poll.new(phase)
    when 'volunteering'
      ::ParticipationMethod::Volunteering.new(phase)
    when 'native_survey'
      ::ParticipationMethod::NativeSurvey.new(phase)
    else
      ::ParticipationMethod::None.new
    end
  end

  def voting_method_for(phase)
    case phase&.voting_method
    when 'budgeting'
      ::VotingMethod::Budgeting.new(phase)
    when 'multiple_voting'
      ::VotingMethod::MultipleVoting.new(phase)
    when 'single_voting'
      ::VotingMethod::SingleVoting.new(phase)
    else
      ::VotingMethod::None.new
    end
  end

  private_class_method :new
end
