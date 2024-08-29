# frozen_string_literal: true

class Factory
  # Singleton design pattern
  def self.instance
    @instance ||= new
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
