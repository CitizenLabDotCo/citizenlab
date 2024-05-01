module XlsxExport
  class ProjectIdeasVotesGenerator
    def generate_project_voting_results_xlsx(project)
      phases = project.phases.where(participation_method: 'voting').includes([:ideas])
      phases_to_titles = add_suffix_to_duplicate_titles(phases) # avoid ArgumentError due to duplicate sheet names

      pa = Axlsx::Package.new

      phases.each do |phase|
        sheet_name = phases_to_titles.find { |hash| hash.key?(phase.id) }[phase.id]
        generate_phase_ideas_votes_sheet pa.workbook, sheet_name, phase
      end

      pa.to_stream
    end

    private

    def generate_phase_ideas_votes_sheet(workbook, sheet_name, phase)
      url_service = Frontend::UrlService.new
      ideas = phase.ideas
      method = phase.voting_method
      t_scope = 'xlsx_export.column_headers'

      columns = [
        { header: I18n.t('input_id', scope: t_scope),    f: ->(i) { i.id }, skip_sanitization: true },
        { header: I18n.t('title', scope: t_scope),       f: ->(i) { multiloc_service.t(i.title_multiloc) } },
        { header: I18n.t('description', scope: t_scope), f: ->(i) { multiloc_service.t(i.body_multiloc) } }
      ]

      columns += if method == 'budgeting'
        [
          { header: "#{I18n.t('picks', scope: t_scope)} / #{I18n.t('participants', scope: t_scope)}",
            # We want the n of times each idea was selected (by a user), not the total budget allocated to each idea (ideas_phase.votes_count)
            f: ->(i) { i.baskets_ideas.joins(:basket).where(basket: { phase_id: phase.id }).where.not(basket: { submitted_at: nil }).size },
            skip_sanitization: true },
          { header: I18n.t('cost', scope: t_scope),
            f: ->(i) { i.budget },
            skip_sanitization: true }
        ]
      else
        [{ header: I18n.t('votes_count', scope: t_scope),
           f: ->(i) { i.ideas_phases.find_by(phase: phase).votes_count },
           skip_sanitization: true }]
      end

      if method == 'multiple_voting'
        columns << { header: I18n.t('participants', scope: t_scope),
                     # We want the n of times each idea was selected (by a user), not the n of votes allocated to each idea (ideas_phase.votes_count)
                     f: ->(i) { i.baskets_ideas.joins(:basket).where(basket: { phase_id: phase.id }).where.not(basket: { submitted_at: nil }).size },
                     skip_sanitization: true }
      end

      columns += [
        { header: I18n.t('input_url', scope: t_scope),       f: ->(i) { url_service.model_to_url(i) }, skip_sanitization: true },
        { header: I18n.t('attachments', scope: t_scope),     f: ->(i) { i.idea_files.map { |f| f.file.url }.join("\n") }, skip_sanitization: true, width: 2 },
        { header: I18n.t('tags', scope: t_scope),            f: ->(i) { i.topics.map { |t| multiloc_service.t(t.title_multiloc) }.join(',') }, skip_sanitization: true },
        { header: I18n.t('latitude', scope: t_scope),        f: ->(i) { i.location_point&.coordinates&.last }, skip_sanitization: true },
        { header: I18n.t('longitude', scope: t_scope),       f: ->(i) { i.location_point&.coordinates&.first }, skip_sanitization: true },
        { header: I18n.t('location', scope: t_scope),        f: ->(i) { i.location_description } },
        { header: I18n.t('project', scope: t_scope),         f: ->(i) { multiloc_service.t(i&.project&.title_multiloc) } },
        { header: I18n.t('status', scope: t_scope),          f: ->(i) { multiloc_service.t(i&.idea_status&.title_multiloc) } },
        { header: I18n.t('author_fullname', scope: t_scope), f: ->(i) { xlsx_service.format_author_name i } },
        { header: I18n.t('author_email', scope: t_scope),    f: ->(i) { i.author&.email } },
        { header: I18n.t('author_id', scope: t_scope),       f: ->(i) { i.author_id } },
        { header: I18n.t('published_at', scope: t_scope),    f: ->(i) { i.published_at }, skip_sanitization: true }
      ]

      xlsx_service.generate_sheet workbook, sheet_name, columns, ideas
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
