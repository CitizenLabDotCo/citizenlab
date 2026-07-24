# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal attachments (`06---attachments.csv`, nested in a proposals component) ──▶ Go Vocal
    # file attachments on the imported Idea. Each attachment becomes three records:
    #   * `Files::File` — the file itself (content fetched from `remote_content_url` at apply time).
    #   * `Files::FilesProject` — the ownership join placing the file in the idea's project, which the
    #     attachment validation (`validate_file_belongs_to_project`) requires.
    #   * `Files::FileAttachment` — the polymorphic attachment surfacing the file on the idea
    #     (`attachable`: the idea), with `position` from the Decidim weight.
    #
    # The row's `attached_to` is the proposal uid (→ idea) and its process stamp gives the project. Runs
    # after the proposals extractor so both resolve. Skipped when the proposal wasn't imported, the file
    # has no URL, or no filename can be derived. As with process files, an unreachable file (or images
    # off) is pruned with its join/attachment before deserialize ({Importer.prune_fileless_attachments!}).
    class ProposalAttachmentsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        weight: 'weight',
        file: 'file',
        attached_to: 'attached_to',
        process: 'decidim_participatory_process'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows.filter_map { |row| build_attachment(row) }
      end

      private

      def build_attachment(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        idea = ref_map.fetch(present_value(row[COLUMNS[:attached_to]]))
        return skip(uid, 'attached-to proposal not imported') unless idea&.model_name == 'idea'

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        return skip(uid, 'no project for attachment') if project.nil?

        url = present_value(row[COLUMNS[:file]])
        return skip(uid, 'attachment has no file url') if url.nil?

        name = attachment_name(url, multiloc(row[COLUMNS[:title]]))
        return skip(uid, 'attachment has no derivable name') if name.nil?

        file = Record.new('files/file', {
          'id' => SecureRandom.uuid,
          'name' => name,
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'remote_content_url' => url
        })
        ref_map.register(uid, file)

        register_files_project(uid, file, project)
        register_file_attachment(uid, file, idea, row)
        file
      end

      # The ownership join placing the file in the idea's project, so the attachment validation passes.
      def register_files_project(uid, file, project)
        files_project = Record.new('files/files_project', {})
        files_project.reference('file', file)
        files_project.reference('project', project)
        ref_map.register("#{uid}-files-project", files_project)
      end

      # The attachment surfacing the file on the idea, preserving the Decidim weight as its position.
      def register_file_attachment(uid, file, idea, row)
        attachment = Record.new('files/file_attachment', { 'position' => ordering_for(row) })
        attachment.reference('file', file)
        attachment.reference('attachable', idea)
        ref_map.register("#{uid}-file-attachment", attachment)
      end

      def ordering_for(row)
        weight = present_value(row[COLUMNS[:weight]])
        weight && Integer(weight, exception: false)
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
