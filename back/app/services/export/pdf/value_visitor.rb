# frozen_string_literal: true

module Export
  module Pdf
    # Formats custom field values for the survey responses PDF. Reuses the xlsx
    # visitor for most types, but renders file-upload answers as the file *name*
    # (rather than a URL, which isn't useful in a printed document). Geographic
    # answers fall through to the parent's GeoJSON text.
    class ValueVisitor < Export::Xlsx::ValueVisitor
      def visit_file_upload(field)
        file_name_for(value_for(field)['id'])
      end

      def visit_shapefile_upload(field)
        visit_file_upload(field)
      end

      private

      # Resolve the file id stored by a file-upload answer to its file name.
      # Mirrors the parent xlsx resolver, which looks in both associations.
      def file_name_for(file_id)
        return '' unless file_id

        file = model.idea_files.detect { |f| f.id == file_id }
        return file.name if file

        attachment = model.file_attachments.detect { |f| f.id == file_id }
        attachment&.file&.name.to_s
      end
    end
  end
end
