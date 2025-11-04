class ParticipationsService
  include Singleton

  def phase_participation(phase)
    participations = phase_participations(phase)

    # For other requests, some kind of filtering might be applied here
    format_participation_data(participations)
  end

  def permission_participation(permission)
    participations = phase_participations(permission.phase)

    particiption.filter(by(permission.action))

    # For other requests, some kind of filtering might be applied here
    format_participation_data(participations)
  end

  private

  def filter_by_permission(participations, action); end

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
