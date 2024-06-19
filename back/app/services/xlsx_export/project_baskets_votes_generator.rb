module XlsxExport
  class ProjectBasketsVotesGenerator < Generator
    def generate_project_baskets_votes_xlsx(project)
      phases = project.phases.where(participation_method: 'voting').includes([:ideas])
      phases_to_titles = add_suffix_to_duplicate_titles(phases) # avoid ArgumentError due to duplicate sheet names

      pa = Axlsx::Package.new

      phases.each do |phase|
        sheet_name = phases_to_titles[phase.id]
        generate_phase_baskets_votes_sheet pa.workbook, sheet_name, phase
      end

      pa.to_stream
    end

    private

    def generate_phase_baskets_votes_sheet(workbook, sheet_name, phase)
      baskets = Basket.where(phase: phase).where.not(submitted_at: nil).includes(:user, :baskets_ideas)
      columns = xlsx_service.user_custom_field_columns(:user)
      ideas = phase.ideas
      ideas_to_titles = add_suffix_to_duplicate_titles(ideas) # avoid losing columns with duplicate headers

      ideas.each do |idea|
        columns << {
          header: ideas_to_titles[idea.id],
          f: ->(b) { b.baskets_ideas.find { |baskets_idea| baskets_idea[:idea_id] == idea.id }&.votes || 0 },
          skip_sanitization: true
        }
      end

      columns << {
        header: I18n.t('submitted_at', scope: 'xlsx_export.column_headers'),
        f: ->(b) { b.submitted_at }, skip_sanitization: true
      }

      xlsx_service.generate_sheet workbook, sheet_name, columns, baskets
    end
  end
end
