module Participation
  extend ActiveSupport::Concern

  def participation
    participation_service.phase_participation(self) if is_a?(Phase)
  end

  def demographics
    participation_service.phase_demographics(self) if is_a?(Phase)
  end

  private

  def participation_service
    @participation_service ||= ParticipationsService.instance
  end
end
