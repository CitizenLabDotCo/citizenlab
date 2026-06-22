# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim process attachments (`05---attachments.csv`) ──▶ Go Vocal project file attachments
    # (`ProjectFile`).
    #
    # The attachments CSV has no process column — the directory is the association — so the importer
    # stamps each row with its owning process (`decidim_participatory_process`) and the project is
    # looked up in the ref map. The file itself is fetched from its `remote_file_url` at apply time
    # (or pruned by the importer when the URL is unreachable / images are disabled). The display name
    # is the URL's percent-decoded basename, which preserves the original extension; the attachment
    # title is used as a fallback when the URL has no usable filename.
    class FilesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
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

        file = Record.new('project_file', {
          'name' => name,
          'ordering' => ordering_for(row),
          'remote_file_url' => url
        })
        file.reference('project', project)
        ref_map.register(uid, file)
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
