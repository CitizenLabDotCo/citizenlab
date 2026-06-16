# frozen_string_literal: true

module Export
  module Pdf
    # Formats custom field values for the survey responses PDF. Reuses the xlsx
    # visitor for most types, but renders file fields as file *names* (rather
    # than URLs, which aren't useful in a printed document) and geographic
    # fields as GeoJSON text.
    class ValueVisitor < Export::Xlsx::ValueVisitor
      def visit_file_upload(field)
        file_name_for(value_for(field)['id'])
      end

      def visit_shapefile_upload(field)
        visit_file_upload(field)
      end

      def visit_files(field)
        return built_in_file_names if field.code == 'idea_files_attributes'

        ''
      end

      def visit_image_files(_field)
        built_in_file_names
      end

      private

      def file_name_for(file_id)
        return '' unless file_id

        file = model.idea_files.detect { |f| f.id == file_id }
        return file.name if file

        attachment = model.file_attachments.detect { |f| f.id == file_id }
        attachment&.file&.name.to_s
      end

      def built_in_file_names
        names = model.idea_files.map(&:name) +
                model.file_attachments.map { |attachment| attachment.file.name }
        names.join("\n")
      end
    end
  end
end
