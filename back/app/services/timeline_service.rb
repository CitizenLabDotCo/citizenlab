# frozen_string_literal: true

class TimelineService
  def future_phases(project, time = Time.now)
    project.phases.where('start_at > ?', time)
  end

  def past_phases(project, time = Time.now)
    project.phases.where('end_at IS NOT NULL AND end_at <= ?', time)
  end

  def current_phase(project, time = Time.now)
    project.phases.find do |phase|
      phase.start_at <= time && (phase.end_at.nil? || time < phase.end_at)
    end
  end

  def current_phase_not_archived(project, time = Time.now)
    return nil if project.admin_publication.archived?

    current_phase project, time
  end

  def current_phase_or_last_completed_not_archived(project, time = Time.now)
    return nil if project.admin_publication.archived?

    phase = current_phase(project, time)
    return phase if phase

    past_phases(project, time).max_by(&:end_at)
  end

  def phase_is_complete?(phase, time = Time.now)
    phase.end_at.present? && phase.end_at <= time
  end

  def current_or_backup_transitive_phase(project, time = Time.now)
    # This method is used to determine which project phase is the most relevant with
    # respect to the input form. For example, to select the input term from the right
    # phase.
    return if project.phases.blank?

    current = current_phase(project, time)
    current_method = current&.pmethod
    return current if current_method&.transitive? || current_method&.supports_public_visibility?

    project.phases.select { |phase| phase.pmethod.transitive? }&.last
  end

  def current_and_future_phases(project, time = Time.now)
    project.phases.where('end_at IS NULL OR end_at > ?', time)
  end

  def in_active_phase?(idea)
    idea.phases.include?(current_phase(idea.project))
  end

  def overlaps?(phase1, phase2)
    period1 = phase1.start_at...phase1.end_at
    period2 = phase2.start_at...phase2.end_at
    period1.overlap?(period2)
  end

  def other_project_phases(phase)
    Phase.where(project_id: phase.project_id).all.reject { |p| p.id == phase.id }
  end

  def timeline_active(project)
    timeline_active_on_collection([project]).values.sole
  end

  def timeline_active_on_collection(projects)
    now = Time.now

    starts = Phase.where(project: projects).group(:project_id).minimum(:start_at)
    ends = Phase.where(project: projects)
      .group(:project_id)
      .maximum(Arel.sql("coalesce(end_at, 'infinity'::timestamp)"))

    projects.to_h do |project|
      active_status = if starts[project.id].blank? # No phases
        nil
      elsif now < starts[project.id]
        :future
      elsif now >= ends[project.id]
        :past
      else
        :present
      end

      [project.id, active_status]
    end
  end

  def phase_number(phase)
    phase_ids = phase.project.phase_ids
    phase_ids.find_index(phase.id) + 1
  end

  def previous_phase(phase)
    Phase
      .where.not(id: phase.id)
      .where(project_id: phase.project_id)
      .where('start_at < ?', phase.start_at)
      .order(start_at: :desc)
      .first
  end

  def last_phase?(phase)
    other_project_phases = Phase.where(project_id: phase.project_id).where.not(id: phase.id)
    return true if other_project_phases.blank?
    return false if !phase.start_at

    other_project_phases.maximum(:start_at) < phase.start_at
  end
end
