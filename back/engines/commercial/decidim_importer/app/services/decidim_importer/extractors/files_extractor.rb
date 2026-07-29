# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim process attachments (`05---attachments.csv`) ──▶ Go Vocal files (the `Files::` engine).
    #
    # Each becomes two records:
    #   * `Files::File` — the file (content fetched from `remote_content_url` at apply time), with a name
    #     built from the attachment title. No `title_multiloc` — the human-readable title *is* the name.
    #   * `Files::FilesProject` — ownership join placing the file in the project's file repository.
    #
    # Deliberately *not* surfaced as a project attachment (no `Files::FileAttachment`): the Decidim
    # attachments instead appear as links in the Content Builder description
    # ({Extractors::DescriptionLayoutExtractor}, which finds files through the `files_project` join).
    # An unreachable file (or images off) is pruned with its ownership join before deserialize
    # ({Importer.prune_fileless_attachments!}).
    class FilesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        file: 'file',
        process: 'decidim_participatory_process'
      }.freeze

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

        name = attachment_name(url, multiloc(row[COLUMNS[:title]]))
        return skip(uid, 'attachment has no derivable name') if name.nil?

        # An explicit id so the project-description layout's FileAttachment block can reference this
        # file (craftjs stores the file id verbatim; refs can't reach into the JSONB blob).
        file = Record.new('files/file', {
          'id' => SecureRandom.uuid,
          'name' => name,
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'remote_content_url' => url
        })
        ref_map.register(uid, file)

        register_files_project(uid, file, project)
        file
      end
    end
  end
end
