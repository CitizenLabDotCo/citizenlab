# frozen_string_literal: true

class TimelineService
  def future_phases(project, time = Time.now)
    date = tenant_timezone.at(time).to_date
    project.phases.select do |phase|
      phase.start_at > date
    end
  end

  def past_phases(project, time = Time.now)
    date = tenant_timezone.at(time).to_date
    project.phases.select do |phase|
      phase.end_at&.< date
    end
  end

  def current_phase(project, time = Time.now)
    date = tenant_timezone.at(time).to_date
    project.phases.find do |phase|
      phase.start_at <= date && (phase.end_at.nil? || phase.end_at >= date)
    end
  end

  def current_phase_not_archived(project, time = Time.now)
    return nil if project.admin_publication.archived?

    current_phase project, time
  end

  def phase_is_complete?(phase, time = Time.now)
    date = tenant_timezone.at(time).to_date
    phase.end_at.present? && phase.end_at <= date
  end

  def current_or_last_can_contain_ideas_phase(project, time = Time.now)
    date = tenant_timezone.at(time).to_date

    phases = project.phases
    return if phases.blank?

    ideation_phases = phases.select(&:can_contain_ideas?)
    return if ideation_phases.blank?

    current_phase = ideation_phases.find { |phase| phase.start_at <= date && (phase.end_at.nil? || date <= phase.end_at) }
    current_phase || ideation_phases.last
  end

  def current_and_future_phases(project, time = Time.now)
    date = tenant_timezone.at(time).to_date

    project.phases.select do |phase|
      phase.end_at.nil? || phase.end_at >= date
    end
  end

  def in_active_phase?(idea)
    idea.phases.include?(current_phase(idea.project))
  end

  def overlaps?(phase1, phase2)
    return true if (phase1.start_at.blank? && phase1.end_at.blank?) || (phase2.start_at.blank? && phase2.end_at.blank?) || (phase1.end_at.blank? && phase2.end_at.blank?)
    return (phase2.end_at > phase1.start_at) if phase1.end_at.blank?
    return (phase1.end_at > phase2.start_at) if phase2.end_at.blank?

    !((phase1.end_at.to_date < phase2.start_at.to_date) || (phase2.end_at.to_date < phase1.start_at.to_date))
  end

  def other_project_phases(phase)
    Phase.where(project_id: phase.project_id).all.reject { |p| p.id == phase.id }
  end

  def timeline_active(project)
    today = tenant_timezone.at(Time.now).to_date
    if project.phases.blank?
      nil
    elsif today < project.phases.minimum(:start_at)
      :future
    elsif project.phases.last.end_at.present? && today > project.phases.maximum(:end_at)
      :past
    else
      :present
    end
  end

  def timeline_active_on_collection(projects)
    projects = projects.to_a
    today = tenant_timezone.at(Time.now).to_date
    starts = Phase.where(project: projects).group(:project_id).minimum(:start_at)
    ends = Phase.where(project: projects).group(:project_id).maximum(:end_at)

    # For any projects open end dates?
    open_end_starts = Phase.where(project: projects, end_at: nil).group(:project_id).maximum(:start_at)

    projects.to_h do |project|
      active = if project.phases.blank?
        nil
      elsif today < starts[project.id]
        :future
      elsif open_end_starts[project.id].blank? && today > ends[project.id]
        :past
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

  private

  def tenant_timezone
    @tenant_timezone ||= AppConfiguration.timezone
  end
end
