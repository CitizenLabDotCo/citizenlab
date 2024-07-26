module CustomMaps
  class GeojsonValueVisitor < XlsxExport::ValueVisitor
    def default(field)
      value_for(field).presence
    end

    def visit_text(field)
      value_for(field).presence
    end

    def visit_multiline_text(field)
      value_for(field).presence
    end

    def visit_select(field)
      option_value = value_for(field)
      return nil if option_value.blank?

      option_title = option_index[option_value]&.title_multiloc
      value_for_multiloc option_title
    end

    def visit_file_upload(field)
      file = value_for(field)

      return nil if file['id'].blank?

      file_id = file['id']
      idea_file = model.idea_files.detect { |f| f.id == file_id }
      idea_file.file.url
    end

    def visit_point(field)
      value_for(field).presence
    end

    def visit_line(field)
      value_for(field).presence
    end

    def visit_polygon(field)
      value_for(field).presence
    end
  end
end
