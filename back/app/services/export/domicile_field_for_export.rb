module Export
  class DomicileFieldForExport < CustomFieldForExport
    private

    def option_index
      @option_index ||= Area.all.index_by(&:id)
    end
  end
end
