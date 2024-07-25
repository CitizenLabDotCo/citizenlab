module CustomMaps
  class GeojsonValueVisitor < XlsxExport::ValueVisitor
    def visit_point(field)
      value_for(field)
    end

    def visit_line(field)
      value_for(field)
    end

    def visit_polygon(field)
      value_for(field)
    end
  end
end
