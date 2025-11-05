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
    actions_level = participations.transform_values do |records|
      format_participation_data(records)
    end

    { **phase_level, actions: [actions_level] }
  end

  def format_participation_data(participations)
    all_participant_ids = participations.pluck(:user_id).uniq
    participants_before_7_days_ids = participations.select { |p| p[:acted_at] < 7.days.ago }.pluck(:user_id).uniq
    participants_after_7_days_ids = participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:user_id).uniq
    participants_change_last_7_days = (participants_after_7_days_ids - participants_before_7_days_ids).count

    {
      participations: {
        count: participations.count,
        change_last_7_days: participations.count { |p| p[:acted_at] >= 7.days.ago }
      },
      participants: {
        count: all_participant_ids.count,
        change_last_7_days: participants_change_last_7_days,
        demographics: [
          { tbc: 'tbc' } # Placeholder for demographics data
        ]
      }
    }
  end
end
