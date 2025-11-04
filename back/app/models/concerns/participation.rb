module Participation
  extend ActiveSupport::Concern

  def participation
    participation_service = ParticipationsService.instance

    # Check which type of model is including this concern
    if is_a?(Phase)
      participation_service.phase_participation(self)
    end
  end
end
