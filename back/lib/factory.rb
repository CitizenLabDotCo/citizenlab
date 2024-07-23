# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
  end

  def participation_method_for(participation_context)
    # NOTE: if a project is passed to this method, timeline projects used to always return 'Ideation'
    # as it was never set and defaulted to this when the participation_method was available on the project
    # The following mimics the same behaviour now that participation method is not available on the project
    # TODO: Maybe change to find phase with ideation or voting where created date between start and end date?
    if participation_context.instance_of?(::Project)
      ::ParticipationMethod::Ideation.new(participation_context.phases.first)
    else
      participation_context.participation_method
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
