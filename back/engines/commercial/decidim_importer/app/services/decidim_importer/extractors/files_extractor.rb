# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim process attachments (`05---attachments.csv`) ──▶ Go Vocal files (the `Files::` engine).
    #
    # Each Decidim attachment becomes three records, mirroring how the app itself models a project
    # file attachment:
    #   * `Files::File` — the file itself (content fetched from `remote_content_url` at apply time),
    #     carrying the Decidim title/description multilocs and a filename derived from the URL.
    #   * `Files::FilesProject` — the ownership join placing the file in the project's file repository
    #     (required: a file attached to a project resource must belong to that project).
    #   * `Files::FileAttachment` — the polymorphic attachment (`attachable`: the project) that surfaces
    #     the file as a project attachment, with `position` taken from the Decidim weight.
    #
    # The attachments CSV has no process column — the directory is the association — so the importer
    # stamps each row with its owning process (`decidim_participatory_process`) and the project is
    # looked up in the ref map. If a file's URL turns out to be unreachable (or images are disabled),
    # the importer prunes the file *and* its join/attachment records before deserialize
    # ({Importer.prune_fileless_attachments!}).
    class FilesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        weight: 'weight',
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

        file = Record.new('files/file', {
          'name' => name,
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'remote_content_url' => url
        })
        ref_map.register(uid, file)

        register_files_project(uid, file, project)
        register_file_attachment(uid, file, project, row)
        file
      end

      # The ownership join: the file belongs to the project's file repository. Required before the
      # attachment, whose `validate_file_belongs_to_project` checks the file's `files_projects`.
      def register_files_project(uid, file, project)
        files_project = Record.new('files/files_project', {})
        files_project.reference('file', file)
        files_project.reference('project', project)
        ref_map.register("#{uid}-files-project", files_project)
      end

      # The attachment that surfaces the file on the project, preserving the Decidim weight as its
      # position. `attachable` is a polymorphic ref pointing at the project record.
      def register_file_attachment(uid, file, project, row)
        attachment = Record.new('files/file_attachment', { 'position' => ordering_for(row) })
        attachment.reference('file', file)
        attachment.reference('attachable', project)
        ref_map.register("#{uid}-file-attachment", attachment)
      end

      def ordering_for(row)
        weight = present_value(row[COLUMNS[:weight]])
        weight && Integer(weight, exception: false)
      end

      # The download filename: the URL's percent-decoded basename (keeps the extension). Falls back to
      # the attachment title when the URL has no usable basename (e.g. a path of `/` or empty).
      def filename_for(url, row)
        basename = File.basename(URI.parse(url).path.to_s)
        decoded = CGI.unescape(basename)
        usable = present_value(decoded) unless decoded.in?(%w[/ .])
        usable || present_value(title_text(row))
      rescue URI::InvalidURIError
        present_value(title_text(row))
      end

      def title_text(row)
        multiloc(row[COLUMNS[:title]]).values.first
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
