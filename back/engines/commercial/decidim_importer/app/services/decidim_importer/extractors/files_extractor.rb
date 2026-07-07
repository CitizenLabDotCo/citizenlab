# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim process attachments (`05---attachments.csv`) ──▶ Go Vocal files (the `Files::` engine).
    #
    # Each Decidim attachment becomes two records:
    #   * `Files::File` — the file itself (content fetched from `remote_content_url` at apply time),
    #     carrying the Decidim title/description multilocs and a filename derived from the URL.
    #   * `Files::FilesProject` — the ownership join placing the file in the project's file repository,
    #     so it's available in the project's files and can be linked from the project description.
    #
    # The file is deliberately *not* surfaced as a project attachment (no `Files::FileAttachment` with
    # the project as `attachable`): the Decidim attachments instead appear as links in the project's
    # Content Builder description ({Extractors::DescriptionLayoutExtractor}, which finds a project's
    # files through the `files_project` join).
    #
    # The attachments CSV has no process column — the directory is the association — so the importer
    # stamps each row with its owning process (`decidim_participatory_process`) and the project is
    # looked up in the ref map. If a file's URL turns out to be unreachable (or images are disabled),
    # the importer prunes the file *and* its ownership join before deserialize
    # ({Importer.prune_fileless_attachments!}).
    class FilesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        file: 'file',
        process: 'decidim_participatory_process'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows.filter_map { |row| build_file(row) }
      end

      private

      def build_file(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        return skip(uid, 'no project for attachment') if project.nil?

        url = present_value(row[COLUMNS[:file]])
        return skip(uid, 'attachment has no file url') if url.nil?

        name = filename_for(url, row)
        return skip(uid, 'attachment has no derivable name') if name.nil?

        # An explicit id so the project-description layout's FileAttachment block can reference this
        # file (craftjs stores the file id verbatim; refs can't reach into the JSONB blob).
        file = Record.new('files/file', {
          'id' => SecureRandom.uuid,
          'name' => name,
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'remote_content_url' => url
        })
        ref_map.register(uid, file)

        register_files_project(uid, file, project)
        file
      end

      # The ownership join: the file belongs to the project's file repository, which is what makes it
      # available to the project and lets the description layout link to it.
      def register_files_project(uid, file, project)
        files_project = Record.new('files/files_project', {})
        files_project.reference('file', file)
        files_project.reference('project', project)
        ref_map.register("#{uid}-files-project", files_project)
      end

      def filename_for(url, row)
        filename_from_url(url, multiloc(row[COLUMNS[:title]]).values.first)
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
