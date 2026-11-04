# frozen_string_literal: true

module McpServer
  # The rows a reporting query may read: every row, or only the rows of a set of
  # projects. A stored result keeps it as a stamp, so it can be checked and re-run
  # later with the same scope.
  QueryScope = Data.define(:project_ids) do
    def self.all = new(project_ids: :all)

    # An active admin reads every row, not just the rows of every project: some
    # rows belong to no project. Anyone else, a blocked admin included, gets the
    # projects they may analyse, which is none for a visitor or a resident.
    def self.for(user)
      return all if user&.active? && user.admin?

      new(project_ids: ProjectPolicy::ReportingScope.new(user, Project).resolve.ids.sort)
    end

    def self.from_stamp(stamp)
      stamp == 'all' ? all : new(project_ids: stamp.fetch('project_ids').sort)
    end

    def all? = project_ids == :all

    def to_stamp = all? ? 'all' : { 'project_ids' => project_ids }

    # Whether `other` can read every row this scope reads.
    def within?(other)
      other.all? || (!all? && (project_ids - other.project_ids).empty?)
    end

    # Only the rows of these projects, and only those this scope already reads. Every
    # row becomes just these projects' rows.
    def limited_to(ids)
      self.class.new(project_ids: (all? ? ids : project_ids & ids).uniq.sort)
    end
  end
end
