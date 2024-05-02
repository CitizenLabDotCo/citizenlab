module XlsxExport
  class ProjectBasketsVotesGenerator < Generator
    def generate_project_baskets_votes_xlsx(project)
      phases = project.phases.where(participation_method: 'voting').includes([:ideas])
      phases_to_titles = add_suffix_to_duplicate_titles(phases) # avoid ArgumentError due to duplicate sheet names

      pa = Axlsx::Package.new

      phases.each do |phase|
        sheet_name = phases_to_titles.find { |hash| hash.key?(phase.id) }[phase.id]
        generate_phase_baskets_votes_sheet pa.workbook, sheet_name, phase
      end

      pa.to_stream
    end

    private

    def generate_phase_baskets_votes_sheet(workbook, sheet_name, phase)
      baskets = Basket.where(phase: phase).where.not(submitted_at: nil).includes([:user])
      columns = xlsx_service.user_custom_field_columns(:user)
      ideas = phase.ideas
      ideas_to_titles = add_suffix_to_duplicate_titles(ideas) # avoid losing columns with duplicate headers

      ideas.each do |idea|
        columns << {
          header: ideas_to_titles.find { |hash| hash.key?(idea.id) }[idea.id],
          f: ->(b) { b.baskets_ideas.find_by(idea: idea)&.votes || 0 },
          skip_sanitization: true
        }
      end

      columns << {
        header: I18n.t('created_at', scope: 'xlsx_export.column_headers'),
        f: ->(b) { b.submitted_at }, skip_sanitization: true
      }

      xlsx_service.generate_sheet workbook, sheet_name, columns, baskets
    end

    def add_suffix_to_duplicate_titles(collection)
      objects_to_titles = collection.map { |obj| { obj.id => multiloc_service.t(obj.title_multiloc) } }
      titles = objects_to_titles.map(&:values).flatten
      duplicated_titles = titles.select { |title| titles.count(title) > 1 }.uniq

      duplicated_titles.each do |title|
        suffix = 1

        objects_to_titles.each do |hash|
          next unless hash.value?(title)

          hash[hash.keys.first] = "#{title} (#{suffix})"
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
