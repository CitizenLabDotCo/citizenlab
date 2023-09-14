# frozen_string_literal: true

class TimelineService
  def future_phases(project, time = Time.now)
    date = time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    project.phases.select do |phase|
      phase.start_at > date
    end
  end

  def past_phases(project, time = Time.now)
    date = time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    project.phases.select do |phase|
      phase.end_at < date
    end
  end

  def current_phase(project, time = Time.now)
    date = time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    return unless project.timeline?

    project.phases.find do |phase|
      phase.start_at <= date && phase.end_at >= date
    end
  end

  def phase_is_complete?(participation_context, time = Time.now)
    return false unless participation_context.phase?

    date = time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    participation_context.end_at <= date
  end

  def current_or_last_can_contain_ideas_phase(project, time = Time.now)
    date = time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    return unless project.timeline?

    phases = project.phases
    return if phases.blank?

    ideation_phases = phases.select(&:can_contain_ideas?)
    return if ideation_phases.blank?

    current_phase = ideation_phases.find { |phase| phase.start_at <= date && date <= phase.end_at }
    current_phase || ideation_phases.last
  end

  def current_and_future_phases(project, time = Time.now)
    date = time.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    return unless project.timeline?

    project.phases.select do |phase|
      phase.end_at >= date
    end
  end

  def in_active_phase?(idea)
    idea.phases.include?(current_phase(idea.project))
  end

  def overlaps?(phase1, phase2)
    !((phase1.end_at.to_date < phase2.start_at.to_date) || (phase2.end_at.to_date < phase1.start_at.to_date))
  end

  def other_project_phases(phase)
    Phase.where(project_id: phase.project_id).all.reject { |p| p.id == phase.id }
  end

  def timeline_active(project)
    today = Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    if project.continuous? || project.phases.blank?
      nil
    elsif today > project.phases.maximum(:end_at)
      :past
    elsif today < project.phases.minimum(:start_at)
      :future
    else
      :present
    end
  end

  def timeline_active_on_collection(projects)
    today = Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_date
    starts = Phase.where(project: projects).group(:project_id).minimum(:start_at)
    ends = Phase.where(project: projects).group(:project_id).maximum(:end_at)
    projects.to_h do |project|
      active = if project.continuous? || project.phases.blank?
        nil
      elsif today > ends[project.id]
        :past
      elsif today < starts[project.id]
        :future
      else
        :present
      end
      [project.id, active]
    end
  end

  def phase_number(phase)
    phase_ids = phase.project.phase_ids
    phase_ids.find_index(phase.id) + 1
  end
end
