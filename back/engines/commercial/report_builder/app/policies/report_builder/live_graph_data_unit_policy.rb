module ReportBuilder
  class LiveGraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      phase_id = record[:phase_id]
      project_id = record[:project_id]

      return active_admin? if phase_id.blank? && project_id.blank?

      # A list of ids would authorize one record and query them all.
      return false unless [phase_id, project_id].all? { |id| id.blank? || id.is_a?(String) }

      # A widget can carry both ids, and each query reads only the ones it needs.
      # An id that nobody checks is a way into another project's data.
      (phase_id.blank? || active_moderator_of?(Phase.find_by(id: phase_id))) &&
        (project_id.blank? || active_moderator_of?(Project.find_by(id: project_id)))
    end

    private

    # Looking the id up with #find would raise out of the policy and skip the
    # other id's check, so an unknown id denies instead.
    def active_moderator_of?(target)
      return false if target.nil?

      policy_for(target).active_moderator?
    end
  end
end
