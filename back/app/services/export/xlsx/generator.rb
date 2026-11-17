module Export
  module Xlsx
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

      # Sheet names must be unique (ignoring case) and at most 31 characters
      # after sanitizing, so duplicates are found on the sanitized names and
      # the suffix is kept within the limit.
      def unique_sheet_names(collection)
        names = collection.to_h { |obj| [obj.id, utils.sanitize_sheetname(multiloc_service.t(obj.title_multiloc))] }
        duplicated = names.values.map(&:downcase).tally.select { |_, count| count > 1 }.keys
        counters = Hash.new(0)

        names.transform_values do |name|
          next name unless duplicated.include?(name.downcase)

          suffix = " (#{counters[name.downcase] += 1})"
          "#{name[0, 31 - suffix.length]}#{suffix}"
        end
      end

      def utils
        @utils ||= Utils.new
      end

      def multiloc_service
        @multiloc_service ||= MultilocService.new
      end

      def xlsx_service
        @xlsx_service ||= XlsxService.new
      end
    end
  end
end
