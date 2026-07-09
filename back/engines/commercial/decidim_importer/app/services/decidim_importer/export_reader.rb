# frozen_string_literal: true

module DecidimImporter
  # Reads a directory of already-unzipped Decidim CSVs into an in-memory `rows_by_model` hash — the
  # sole input to {Importer}. It only traverses the export's directory layout and parses CSVs; turning
  # those rows into a tenant template is {Importer}'s job.
  #
  # Globs are written with `--` separators but `*` absorbs the extra dash in newer exports' `NN---name`
  # triple-dash naming, and `*` matches the empty string so the numeric `NN---` prefix is optional too.
  # Several CSVs carry no foreign-key column — the directory *is* the association — so their rows are
  # stamped with their owning process (`decidim_participatory_process`) and, inside a component, that
  # component (`decidim_component`).
  #
  # Both participatory processes and assemblies become Go Vocal projects and are read through the same
  # code (see {CONTAINERS}): they share the container layout (a container CSV plus attachment/collection/
  # category sidecars and a `NN---components/` subtree). Assemblies carry no Decidim process group, so
  # their project rows are stamped with the synthetic {ASSEMBLIES_FOLDER_UID} and a single "Assemblies"
  # folder is injected for them to nest under.
  module ExportReader
    # Single-file CSVs at the export root, by model.
    FILE_PATTERNS = {
      organization: '*--organization.csv',
      users: '*--users.csv',
      scopes: '*--scopes.csv',
      folders: '*participatory-processes/*--participatory-process-groups.csv'
    }.freeze

    # One directory per process under `NN---participatory-processes/`, holding the process CSV and
    # per-component subdirectories.
    PROCESS_DIR_GLOB = '*participatory-processes/*'
    PROCESS_FILE_GLOB = '*--participatory-process.csv'
    # Assemblies live under `NN---assemblies/`, one directory each, holding an `NN---assembly.csv` and
    # the same sidecars/components subtree as a process.
    ASSEMBLY_DIR_GLOB = '*assemblies/*'
    ASSEMBLY_FILE_GLOB = '*--assembly.csv'
    # Synthetic folder that gathers every imported assembly (assemblies have no Decidim process group).
    ASSEMBLIES_FOLDER_UID = 'decidim_importer-assemblies-folder'
    ASSEMBLIES_FOLDER_TITLE = 'Assemblies'

    # Each process's `NN---components/` folder holds one subdirectory per component, named
    # `NN---decidim--component--N---<type>`; the type is the trailing path segment. Proposals, surveys,
    # pages and accountability are consumed; other types are recorded only for skip-logging.
    COMPONENT_DIR_GLOB = '*components/*'
    COMPONENT_FILE_GLOB = '*--component.csv'
    PROPOSALS_COMPONENT = 'proposals'
    SURVEYS_COMPONENT = 'surveys'
    PAGES_COMPONENT = 'pages'
    ACCOUNTABILITY_COMPONENT = 'accountability'

    # The two container kinds read into the `:projects` stream. `project_stamp` is merged onto each
    # container's project rows: assemblies get the synthetic Assemblies group (routing them into that
    # folder), processes keep whatever `participatory_process_group` their CSV already carries.
    CONTAINERS = [
      { dir_glob: PROCESS_DIR_GLOB, file_glob: PROCESS_FILE_GLOB, project_stamp: {} },
      { dir_glob: ASSEMBLY_DIR_GLOB, file_glob: ASSEMBLY_FILE_GLOB,
        project_stamp: { 'participatory_process_group' => ASSEMBLIES_FOLDER_UID } }
    ].freeze

    # The sibling CSVs read for each consumed component type, as `type => [[glob, acc-key], ...]`. Other
    # component types (blogs, meetings, …) carry no consumed sidecar — only their manifest is recorded.
    # A proposals component's `*--attachments.csv` holds per-proposal attachments, distinct from the
    # container-level `*--attachments.csv` read by {#read_container}.
    COMPONENT_SIDECARS = {
      PROPOSALS_COMPONENT => [['*--proposals.csv', :proposals], ['*--comments.csv', :comments],
        ['*--followers.csv', :followers], ['*--endorsements.csv', :endorsements],
        ['*--attachments.csv', :proposal_attachments]],
      SURVEYS_COMPONENT => [['*--answers.csv', :survey_answers]],
      ACCOUNTABILITY_COMPONENT => [['*--statuses.csv', :accountability_statuses], ['*--results.csv', :results]]
    }.freeze

    module_function

    # Parses the export at `path` (the directory directly containing the CSVs) into a `rows_by_model`
    # hash — the root single-file CSVs plus every process/assembly directory's rows. Empty models are
    # omitted. When assemblies were read, a synthetic "Assemblies" folder is added for them to nest under.
    def read(path)
      rows_by_model = FILE_PATTERNS.each_with_object({}) do |(model, pattern), acc|
        file = Dir.glob(File.join(path, pattern)).first
        acc[model] = CsvReader.read(file) if file
      end
      read_containers(path).each { |model, rows| rows_by_model[model] = rows if rows.any? }
      add_assemblies_folder!(rows_by_model)
      rows_by_model
    end

    # Reads every participatory-process and assembly directory, aggregating rows by model: container rows
    # into `:projects`, attachments/collections/categories, and — from each container's components —
    # proposals, comments, followers, endorsements, results, and every component manifest into
    # `:components` (which drives phase generation and skip-logging). Decidim steps are deliberately not read.
    def read_containers(root)
      acc = { projects: [], attachments: [], attachment_collections: [], categories: [], proposals: [],
              comments: [], followers: [], endorsements: [], proposal_attachments: [], results: [],
              accountability_statuses: [], components: [], survey_answers: [] }
      CONTAINERS.each do |container|
        container_dirs(root, container).each { |dir| read_container(dir, container, acc) }
      end
      acc
    end

    # Reads one process/assembly directory: its rows into `:projects` (stamped with the container's
    # `project_stamp`), then its attachment/collection/category sidecars and component subtree (all
    # stamped with the container uid as `decidim_participatory_process`, so downstream extractors resolve
    # the project the same way for both kinds).
    def read_container(dir, container, acc)
      file = Dir.glob(File.join(dir, container[:file_glob])).first
      return unless file

      rows = CsvReader.read(file)
      acc[:projects].concat(stamp(rows, container[:project_stamp]))
      uid = rows.first&.fetch('uid', nil)
      columns = { 'decidim_participatory_process' => uid }

      read_into(dir, '*--attachments.csv', columns, acc, :attachments)
      read_into(dir, '*--attachment_collections.csv', columns, acc, :attachment_collections)
      read_into(dir, '*--categories.csv', columns, acc, :categories)
      read_components(dir, uid, acc)
    end

    # Injects the single "Assemblies" folder into `:folders` when any assembly project was read (its rows
    # carry the synthetic {ASSEMBLIES_FOLDER_UID} group). The {Extractors::FoldersExtractor} builds it and
    # the {Extractors::ProjectsExtractor} nests the assembly projects under it via the same group mechanism
    # used for participatory-process groups.
    def add_assemblies_folder!(rows_by_model)
      grouped = (rows_by_model[:projects] || []).any? do |row|
        row['participatory_process_group'] == ASSEMBLIES_FOLDER_UID
      end
      return unless grouped

      folder = { 'uid' => ASSEMBLIES_FOLDER_UID, 'title' => ASSEMBLIES_FOLDER_TITLE }
      rows_by_model[:folders] = (rows_by_model[:folders] || []) + [folder]
    end

    # Walks a process's component directories, recording each manifest under `:components` and, for
    # proposals/accountability components, their sibling CSVs (stamped with process + component uid).
    def read_components(process_dir, process_uid, acc)
      component_dirs(process_dir).each do |comp_dir|
        comp_file = Dir.glob(File.join(comp_dir, COMPONENT_FILE_GLOB)).first
        comp_row = comp_file && CsvReader.read(comp_file).first
        next unless comp_row

        type = component_type(comp_dir)
        acc[:components] << comp_row.merge('decidim_participatory_process' => process_uid, 'type' => type)
        columns = { 'decidim_participatory_process' => process_uid, 'decidim_component' => comp_row['uid'] }
        (COMPONENT_SIDECARS[type] || []).each { |glob, key| read_into(comp_dir, glob, columns, acc, key) }
      end
    end

    # Reads the CSV matching `glob` in `comp_dir` (if present), stamps its rows and appends to `acc[key]`.
    def read_into(comp_dir, glob, columns, acc, key)
      file = Dir.glob(File.join(comp_dir, glob)).first
      acc[key].concat(stamp(CsvReader.read(file), columns)) if file
    end

    def stamp(rows, columns)
      rows.map { |row| row.merge(columns) }
    end

    # A container directory is any subdirectory matching the container's `dir_glob` that holds its
    # container CSV (robust to the `NN---decidim--participatory-process--N` / `NN---decidim--assembly--N`
    # naming).
    def container_dirs(root, container)
      Dir.glob(File.join(root, container[:dir_glob])).select do |path|
        File.directory?(path) && Dir.glob(File.join(path, container[:file_glob])).any?
      end
    end

    def component_dirs(process_dir)
      Dir.glob(File.join(process_dir, COMPONENT_DIR_GLOB)).select { |path| File.directory?(path) }
    end

    # The component type is the trailing `---<type>` segment of the directory name, e.g.
    # `01---decidim--component--21---proposals` → `proposals`.
    def component_type(comp_dir)
      File.basename(comp_dir).split('---').last
    end
  end
end
