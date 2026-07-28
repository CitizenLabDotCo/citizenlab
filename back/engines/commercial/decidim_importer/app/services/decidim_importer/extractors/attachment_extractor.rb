# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Shared base for extractors turning Decidim attachments into Go Vocal file attachments on an
    # imported resource. Each attachment becomes three records:
    #   * `Files::File` — the file (content fetched from `remote_content_url` at apply time).
    #   * `Files::FilesProject` — ownership join in the resource's project, required by the attachment
    #     validation (`validate_file_belongs_to_project`).
    #   * `Files::FileAttachment` — the polymorphic attachment surfacing the file, `position` from weight.
    #
    # A subclass declares via `attaches_to` which resource the row's `attached_to` uid resolves to. Runs
    # after that resource's extractor. Skipped when the resource wasn't imported, the file has no URL, or
    # no filename can be derived. An unreachable file (or images off) is pruned with its join/attachment
    # before deserialize ({Importer.prune_fileless_attachments!}).
    class AttachmentExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        weight: 'weight',
        file: 'file',
        attached_to: 'attached_to'
      }.freeze

      class << self
        attr_reader :attachable_model, :source_noun

        # @param model [String] the `model_name` the `attached_to` uid must resolve to (e.g. 'idea').
        # @param noun [String] how to name the source in skip reasons (e.g. 'proposal').
        def attaches_to(model, noun:)
          @attachable_model = model
          @source_noun = noun
        end
      end

      def run
        rows.filter_map { |row| build_attachment(row) }
      end

      private

      def build_attachment(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        attachable = ref_map.fetch(present_value(row[COLUMNS[:attached_to]]))
        return skip(uid, "attached-to #{self.class.source_noun} not imported") unless attachable&.model_name == self.class.attachable_model

        # The file must be owned by the *attachable's* project — that's what
        # `FileAttachment#validate_file_belongs_to_project` checks. Decidim can stamp an attachment with a
        # different space than the resource it's attached to, so derive the project from the attachable
        # rather than the row's process column.
        project_ref = attachable.attributes['project_ref']
        return skip(uid, 'no project for attachment') if project_ref.nil?

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

        register_files_project_ref(uid, file, project_ref)
        register_file_attachment(uid, file, attachable, row)
        file
      end

      # Ownership join placing the file in the attachable's project, sharing the attachable's `project_ref`
      # hash so it resolves to the exact same project on deserialize.
      def register_files_project_ref(uid, file, project_ref)
        files_project = Record.new('files/files_project', {})
        files_project.reference('file', file)
        files_project.attributes['project_ref'] = project_ref
        ref_map.register("#{uid}-files-project", files_project)
      end

      # The attachment surfacing the file on the resource, preserving the Decidim weight as its position.
      def register_file_attachment(uid, file, attachable, row)
        attachment = Record.new('files/file_attachment', { 'position' => ordering_for(row) })
        attachment.reference('file', file)
        attachment.reference('attachable', attachable)
        ref_map.register("#{uid}-file-attachment", attachment)
      end

      def ordering_for(row)
        weight = present_value(row[COLUMNS[:weight]])
        weight && Integer(weight, exception: false)
      end
    end
  end
end
