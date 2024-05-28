module XlsxExport
  class Generator
    private

    def add_suffix_to_duplicate_titles(collection)
      objects_to_titles = collection.to_h { |obj| [obj.id, multiloc_service.t(obj.title_multiloc)] }
      titles = objects_to_titles.values
      duplicated_titles = titles.select { |title| titles.count(title) > 1 }.uniq

      duplicated_titles.each do |title|
        suffix = 1

        objects_to_titles.each do |k, v|
          next unless v == title

          objects_to_titles[k] = "#{title} (#{suffix})"
          suffix += 1
        end
      end

      objects_to_titles
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def xlsx_service
      @xlsx_service ||= XlsxService.new
    end
  end
end
