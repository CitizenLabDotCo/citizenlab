# frozen_string_literal: true

module McpServer
  # The rows a reporting query may read: every row, or only the rows of a set of
  # projects.
  QueryScope = Data.define(:project_ids) do
    def self.all = new(project_ids: :all)

    # An active admin reads every row, not just the rows of every project: some
    # rows belong to no project. Anyone else, a blocked admin included, gets the
    # projects they may analyse, which is none for a visitor or a resident.
    #
    # `within` is what the query is about, such as a report's project: given, the
    # scope is limited to it for everyone, admins included.
    def self.for(user, within: nil)
      scope =
        if user&.active? && user.admin?
          all
        else
          new(project_ids: ProjectPolicy::ReportingScope.new(user, Project).resolve.ids.sort)
        end
      within ? scope.limited_to(within) : scope
    end

    def all? = project_ids == :all

    # Only the rows of these projects, and only those this scope already reads.
    def limited_to(ids)
      self.class.new(project_ids: (all? ? ids : project_ids & ids).uniq.sort)
    end
  end
end
