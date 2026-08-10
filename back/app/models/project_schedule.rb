# frozen_string_literal: true

# The project's phases in time, computed from a single time snapshot: the
# active phases, the date spans they cover, and the highlighted phase that
# best represents the project right now — the active phase that ends soonest,
# otherwise the upcoming phase that starts soonest, otherwise the phase that
# ended last.
class ProjectSchedule
  def initialize(project, time = Time.now)
    @project = project
    @time = time.in_time_zone
  end

  def active_phases
    @active_phases ||= project.phases.select { |phase| phase.active?(time) }
  end

  def phases_span
    return @phases_span if defined?(@phases_span)

    @phases_span = span(project.phases)
  end

  def active_span
    return @active_span if defined?(@active_span)

    @active_span = span(active_phases)
  end

  def highlighted_phase
    return @highlighted_phase if defined?(@highlighted_phase)

    @highlighted_phase =
      if active_phases.any?
        dated, open_ended = active_phases.partition(&:end_at)
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

  def span(spanned_phases)
    return if spanned_phases.empty?

    start_date = spanned_phases.map(&:start_date).min
    end_date = spanned_phases.map(&:end_date).max if spanned_phases.all?(&:end_at)
    [start_date, end_date]
  end

  def whole_days_between(from, to)
    (to - from).seconds.in_days.floor
  end
end
