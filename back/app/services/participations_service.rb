class ParticipationsService
  include Singleton

  def phase_participation(phase)
    participations = phase_participations(phase)

    # For other requests, some kind of filtering might be applied here
    # eg for permissions:
    # participations = phase_participations(permission.phase)
    # participations = participations.filter_by_action(participations, permission.action))
    phase_participation_data(participations)
  end

  private

  def initialize
    @phase_participations = {}
  end

  # Fetch and cache participations in singleton for a phase
  def phase_participations(phase)
    @phase_participations[phase.id] ||= phase.pmethod.participations
  end

  def phase_participation_data(participations)
    phase_level = format_participation_data(participations.values.flatten)
    pmethods_level = participations.each_with_object({}) do |(action, records), hash|
      hash[action] = format_participation_data(records)
    end

    phase_level.merge(pmethods_level)
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
