# frozen_string_literal: true

# Determines which single phase best represents a project right now, across
# timeline and standalone phases: the active phase that ends soonest,
# otherwise the upcoming phase that starts soonest, otherwise the phase that
# ended last.
class HighlightedPhaseService
  def initialize(project, time = Time.now)
    @project = project
    @time = time.in_time_zone
  end

  def highlighted_phase
    return @highlighted_phase if defined?(@highlighted_phase)

    @highlighted_phase =
      if (active = project.active_phases(time)).any?
        dated, open_ended = active.partition(&:end_at)
        dated.min_by(&:end_at) || open_ended.first
      elsif (upcoming = project.phases.select { |phase| phase.start_at > time }).any?
        upcoming.min_by(&:start_at)
      else
        project.phases.max_by(&:end_at)
      end
  end

  def participation_status
    phase = highlighted_phase
    return if !phase

    if phase.active?(time)
      :active
    elsif phase.start_at > time
      :upcoming
    else
      :ended
    end
  end

  def days_until_start
    phase = highlighted_phase
    whole_days_between(time, phase.start_at) if phase && phase.start_at > time
  end

  def days_since_end
    phase = highlighted_phase
    whole_days_between(phase.end_at, time) if phase&.end_at && phase.end_at < time
  end

  private

  attr_reader :project, :time

  def whole_days_between(from, to)
    (to - from).seconds.in_days.floor
  end
end
