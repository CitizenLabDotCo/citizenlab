class ParticipationsService
  include Singleton

  def phase_participation(phase)
    participations = phase_participations(phase)

    # For other requests, some kind of filtering might be applied here
    # eg for permissions:
    # participations = phase_participations(permission.phase)
    # participations = participations.filter_by_action(participations, permission.action))
    format_participation_data(participations)
  end

  private

  def initialize
    @phase_participations = {}
  end

  # Fetch and cache participations in singleton for a phase
  def phase_participations(phase)
    @phase_participations[phase.id] ||= phase.pmethod.participations
  end

  def format_participation_data(participations)
    {
      participations: {
        count: participations.count
      },
      participants: {
        count: participations.pluck(:user_id).uniq.count,
        demographics: [
          { tbc: 'tbc' } # Placeholder for demographics data
        ]
      }
    }
  end
end
