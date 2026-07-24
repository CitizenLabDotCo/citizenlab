# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim meeting attachments (`06---attachments.csv`, nested in a meeting subdirectory) ──▶ Go Vocal
    # file attachments on the imported `Event`. Mirrors {Extractors::ProposalAttachmentsExtractor} (the
    # meeting attachment CSV has the identical columns), differing only in the attachable: each
    # attachment becomes three records —
    #   * `Files::File` — the file itself (content fetched from `remote_content_url` at apply time).
    #   * `Files::FilesProject` — the ownership join placing the file in the event's project, which the
    #     attachment validation (`validate_file_belongs_to_project`) requires.
    #   * `Files::FileAttachment` — the polymorphic attachment surfacing the file on the event
    #     (`attachable`: the event), with `position` from the Decidim weight.
    #
    # The row's `attached_to` is the meeting uid (→ event) and its process stamp gives the project. Runs
    # after the meetings extractor so both resolve. Skipped when the meeting wasn't imported, the file
    # has no URL, or no filename can be derived. As with proposal attachments, an unreachable file (or
    # images off) is pruned with its join/attachment before deserialize ({Importer.prune_fileless_attachments!}).
    class MeetingAttachmentsExtractor < BaseExtractor
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

        event = ref_map.fetch(present_value(row[COLUMNS[:attached_to]]))
        return skip(uid, 'attached-to meeting not imported') unless event&.model_name == 'event'

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
        register_file_attachment(uid, file, event, row)
        file
      end

      # The ownership join placing the file in the event's project, so the attachment validation passes.
      def register_files_project(uid, file, project)
        files_project = Record.new('files/files_project', {})
        files_project.reference('file', file)
        files_project.reference('project', project)
        ref_map.register("#{uid}-files-project", files_project)
      end

      # The attachment surfacing the file on the event, preserving the Decidim weight as its position.
      def register_file_attachment(uid, file, event, row)
        attachment = Record.new('files/file_attachment', { 'position' => ordering_for(row) })
        attachment.reference('file', file)
        attachment.reference('attachable', event)
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
