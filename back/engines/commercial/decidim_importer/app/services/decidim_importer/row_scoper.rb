# frozen_string_literal: true

module DecidimImporter
  # Narrows a parsed export (`rows_by_model`) to a chosen set of containers (participatory processes /
  # assemblies, by uid) for a supplemental import. Keeps those containers' projects and container-scoped
  # rows (components, ideas, comments, files…), the users they reference, and the process-group folders
  # they sit in; drops everything global (scopes, organization), which the tenant already holds. Reusing
  # the kept users/folders on apply is the deserializer's job, not this filter's.
  module RowScoper
    module_function

    # Top-level (not container-scoped) streams; each is handled explicitly below rather than by stamp.
    SHARED_STREAMS = %i[organization users scopes folders].freeze

    # User-uid columns on a container-scoped row: a single `author`/`user`, or a JSON `authors` array.
    USER_UID_COLUMNS = %w[author user].freeze
    USER_UID_ARRAY_COLUMNS = %w[authors].freeze

    # @param rows_by_model [Hash{Symbol=>Array<Hash>}]
    # @param container_uids [Array<String>] process/assembly uids to keep
    # @return [Hash{Symbol=>Array<Hash>}] the narrowed rows (empty streams omitted)
    def scope(rows_by_model, container_uids)
      wanted = Array(container_uids).filter_map { |uid| present(uid) }.to_set
      raise ArgumentError, 'RowScoper needs at least one container uid' if wanted.empty?

      scoped = container_scoped_rows(rows_by_model, wanted)
      projects = scoped[:projects] || []
      add_stream(scoped, :users, referenced_users(rows_by_model[:users], scoped.values))
      add_stream(scoped, :folders, referenced_folders(rows_by_model[:folders], projects))
      scoped
    end

    # Keeps only the selected containers' container-scoped rows: `:projects` by their own `uid`, every
    # other non-shared stream by its `decidim_participatory_process` stamp.
    def container_scoped_rows(rows_by_model, wanted)
      rows_by_model.each_with_object({}) do |(model, rows), acc|
        next if SHARED_STREAMS.include?(model)

        kept = if model == :projects
          rows.select { |row| wanted.include?(present(row['uid'])) }
        else
          rows.select { |row| wanted.include?(present(row['decidim_participatory_process'])) }
        end
        acc[model] = kept if kept.any?
      end
    end

    # The users referenced (as author/user) by any kept container-scoped row.
    def referenced_users(users, kept_row_lists)
      return [] if users.blank?

      uids = kept_row_lists.each_with_object(Set.new) do |rows, set|
        rows.each { |row| collect_user_uids(row, set) }
      end
      users.select { |row| uids.include?(present(row['uid'])) }
    end

    def collect_user_uids(row, set)
      USER_UID_COLUMNS.each { |col| set << present(row[col]) }
      USER_UID_ARRAY_COLUMNS.each do |col|
        Array(Parsing.parse_json(row[col])).each { |uid| set << present(uid) }
      end
      set.delete(nil)
    end

    # The process-group folders the kept projects sit in (a project's `participatory_process_group`;
    # assemblies carry the synthetic Assemblies folder uid, so it's kept whenever an assembly is scoped).
    def referenced_folders(folders, projects)
      return [] if folders.blank?

      groups = projects.filter_map { |row| present(row['participatory_process_group']) }.to_set
      folders.select { |row| groups.include?(present(row['uid'])) }
    end

    def add_stream(scoped, key, rows)
      scoped[key] = rows if rows.present?
    end

    def present(value)
      str = value.to_s.strip
      str.empty? ? nil : str
    end
  end
end
