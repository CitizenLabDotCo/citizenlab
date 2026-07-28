# frozen_string_literal: true

# Determines which single phase best represents a project right now, across
# timeline and standalone phases: the active phase that ends soonest,
# otherwise the upcoming phase that starts soonest, otherwise the phase that
# ended last.
class HighlightedPhaseService
  def highlighted_phase(project, time = Time.now)
    time = time.in_time_zone

    active = project.active_phases(time)
    if active.any?
      dated, open_ended = active.partition(&:end_at)
      return dated.min_by(&:end_at) || open_ended.first
    end

    upcoming = project.phases.select { |phase| phase.start_at > time }
    return upcoming.min_by(&:start_at) if upcoming.any?

    project.phases.max_by(&:end_at)
  end

  def participation_state(project, time = Time.now)
    time = time.in_time_zone
    phase = highlighted_phase(project, time)
    return if !phase

    if phase.active?(time)
      :active
    elsif phase.start_at > time
      :upcoming
    else
      :ended
    end
  end
end
