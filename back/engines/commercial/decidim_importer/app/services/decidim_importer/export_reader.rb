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
    ATTACHMENTS_FILE_GLOB = '*--attachments.csv'
    COLLECTIONS_FILE_GLOB = '*--attachment_collections.csv'
    CATEGORIES_FILE_GLOB = '*--categories.csv'
    ANSWERS_FILE_GLOB = '*--answers.csv'

    # Each process's `NN---components/` folder holds one subdirectory per component, named
    # `NN---decidim--component--N---<type>`; the type is the trailing path segment. Proposals, surveys,
    # pages and accountability are consumed; other types are recorded only for skip-logging.
    COMPONENT_DIR_GLOB = '*components/*'
    COMPONENT_FILE_GLOB = '*--component.csv'
    PROPOSALS_FILE_GLOB = '*--proposals.csv'
    COMMENTS_FILE_GLOB = '*--comments.csv'
    FOLLOWERS_FILE_GLOB = '*--followers.csv'
    ENDORSEMENTS_FILE_GLOB = '*--endorsements.csv'
    # Attachments nested *inside* a proposals component (attached to individual proposals), matched only
    # within a component directory — distinct from the process-level `ATTACHMENTS_FILE_GLOB`.
    PROPOSAL_ATTACHMENTS_FILE_GLOB = '*--attachments.csv'
    STATUSES_FILE_GLOB = '*--statuses.csv'
    RESULTS_FILE_GLOB = '*--results.csv'
    PROPOSALS_COMPONENT = 'proposals'
    SURVEYS_COMPONENT = 'surveys'
    PAGES_COMPONENT = 'pages'
    ACCOUNTABILITY_COMPONENT = 'accountability'

    module_function

    # Parses the export at `path` (the directory directly containing the CSVs) into a `rows_by_model`
    # hash — the root single-file CSVs plus every process directory's rows. Empty models are omitted.
    def read(path)
      rows_by_model = FILE_PATTERNS.each_with_object({}) do |(model, pattern), acc|
        file = Dir.glob(File.join(path, pattern)).first
        acc[model] = CsvReader.read(file) if file
      end
      read_processes(path).each { |model, rows| rows_by_model[model] = rows if rows.any? }
      rows_by_model
    end

    # Reads every participatory-process directory, aggregating rows by model: process rows into
    # `:projects`, attachments/collections/categories, and — from each process's components — proposals,
    # comments, followers, endorsements, results, and every component manifest into `:components` (which
    # drives phase generation and skip-logging). Decidim steps are deliberately not read.
    def read_processes(root)
      acc = { projects: [], attachments: [], attachment_collections: [], categories: [], proposals: [],
              comments: [], followers: [], endorsements: [], proposal_attachments: [], results: [],
              accountability_statuses: [], components: [], survey_answers: [] }
      process_dirs(root).each do |dir|
        process_file = Dir.glob(File.join(dir, PROCESS_FILE_GLOB)).first
        next unless process_file

        process_rows = CsvReader.read(process_file)
        acc[:projects].concat(process_rows)
        process_uid = process_rows.first&.fetch('uid', nil)
        process_stamp = { 'decidim_participatory_process' => process_uid }

        attachments_file = Dir.glob(File.join(dir, ATTACHMENTS_FILE_GLOB)).first
        acc[:attachments].concat(stamp(CsvReader.read(attachments_file), process_stamp)) if attachments_file

        collections_file = Dir.glob(File.join(dir, COLLECTIONS_FILE_GLOB)).first
        acc[:attachment_collections].concat(stamp(CsvReader.read(collections_file), process_stamp)) if collections_file

        categories_file = Dir.glob(File.join(dir, CATEGORIES_FILE_GLOB)).first
        acc[:categories].concat(stamp(CsvReader.read(categories_file), process_stamp)) if categories_file

        read_components(dir, process_uid, acc)
      end
      acc
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

        case type
        when PROPOSALS_COMPONENT then read_proposals_component(comp_dir, columns, acc)
        when SURVEYS_COMPONENT then read_into(comp_dir, ANSWERS_FILE_GLOB, columns, acc, :survey_answers)
        when ACCOUNTABILITY_COMPONENT then read_accountability_component(comp_dir, columns, acc)
        end
      end
    end

    def read_proposals_component(comp_dir, columns, acc)
      read_into(comp_dir, PROPOSALS_FILE_GLOB, columns, acc, :proposals)
      read_into(comp_dir, COMMENTS_FILE_GLOB, columns, acc, :comments)
      read_into(comp_dir, FOLLOWERS_FILE_GLOB, columns, acc, :followers)
      read_into(comp_dir, ENDORSEMENTS_FILE_GLOB, columns, acc, :endorsements)
      read_into(comp_dir, PROPOSAL_ATTACHMENTS_FILE_GLOB, columns, acc, :proposal_attachments)
    end

    def read_accountability_component(comp_dir, columns, acc)
      read_into(comp_dir, STATUSES_FILE_GLOB, columns, acc, :accountability_statuses)
      read_into(comp_dir, RESULTS_FILE_GLOB, columns, acc, :results)
    end

    # Reads the CSV matching `glob` in `comp_dir` (if present), stamps its rows and appends to `acc[key]`.
    def read_into(comp_dir, glob, columns, acc, key)
      file = Dir.glob(File.join(comp_dir, glob)).first
      acc[key].concat(stamp(CsvReader.read(file), columns)) if file
    end

    def stamp(rows, columns)
      rows.map { |row| row.merge(columns) }
    end

    # A process directory is any subdirectory of `*participatory-processes/` that holds a
    # participatory-process CSV (robust to the `NN---decidim--participatory-process--N` naming).
    def process_dirs(root)
      Dir.glob(File.join(root, PROCESS_DIR_GLOB)).select do |path|
        File.directory?(path) && Dir.glob(File.join(path, PROCESS_FILE_GLOB)).any?
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
