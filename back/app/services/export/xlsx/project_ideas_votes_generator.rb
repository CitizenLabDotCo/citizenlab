module Export
  module Xlsx
    class ProjectIdeasVotesGenerator < Generator
      def generate_project_ideas_votes_xlsx(project)
        phases = project.phases.where(participation_method: 'voting')
        phases_to_titles = add_suffix_to_duplicate_titles(phases) # avoid ArgumentError due to duplicate sheet names

        pa = Axlsx::Package.new

        phases.each do |phase|
          sheet_name = phases_to_titles[phase.id]
          generate_phase_ideas_votes_sheet pa.workbook, sheet_name, phase
        end

        pa.to_stream
      end

      private

      def generate_phase_ideas_votes_sheet(workbook, sheet_name, phase)
        url_service = Frontend::UrlService.new
        ideas = phase.ideas.includes(:author, :idea_status, :input_topics, :idea_files, :attached_files, :project, :ideas_phases, [baskets_ideas: :basket])
        t_scope = 'xlsx_export.column_headers'
        utils = Utils.new

        columns = [
          { header: I18n.t('input_id', scope: t_scope),    f: ->(i) { i.id }, skip_sanitization: true },
          { header: I18n.t('title', scope: t_scope),       f: ->(i) { utils.multiloc_with_fallback_locale(i, :title_multiloc) } },
          { header: I18n.t('description', scope: t_scope), f: ->(i) { utils.multiloc_with_fallback_locale(i, :body_multiloc) } }
        ]

        Factory.instance.voting_method_for(phase).additional_export_columns.each do |column|
          columns << send(:"#{column}_column", t_scope, phase)
        end

        get_attachments_urls = lambda do |i|
          i.attached_files.map { |f| f.content.url } + i.idea_files.map { |f| f.file.url }
        end

        columns += [
          { header: I18n.t('input_url', scope: t_scope),       f: ->(i) { url_service.model_to_url(i) }, skip_sanitization: true },
          { header: I18n.t('attachments', scope: t_scope),     f: ->(i) { get_attachments_urls.call(i).join("\n") }, skip_sanitization: true, width: 2 },
          { header: I18n.t('tags', scope: t_scope),            f: ->(i) { i.input_topics.map { |t| multiloc_service.t(t.title_multiloc) }.join(',') }, skip_sanitization: true },
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

      def votes_column(translation_scope, phase)
        { header: I18n.t('votes_count', scope: translation_scope),
          f: ->(i) { i.ideas_phases.find { |ideas_phase| ideas_phase[:phase_id] == phase.id }.votes_count },
          skip_sanitization: true }
      end

      def budget_column(translation_scope, _phase)
        { header: I18n.t('cost', scope: translation_scope), f: ->(i) { i.budget }, skip_sanitization: true }
      end

      def picks_column(translation_scope, phase)
        { header: "#{I18n.t('picks', scope: translation_scope)} / #{I18n.t('participants', scope: translation_scope)}",
          f: picks_lambda(phase),
          skip_sanitization: true }
      end

      def participants_column(translation_scope, phase)
        { header: I18n.t('participants', scope: translation_scope), f: picks_lambda(phase), skip_sanitization: true }
      end

      def manual_votes_column(translation_scope, _phase)
        { header: I18n.t('manual_votes', scope: translation_scope), f: ->(idea) { idea.manual_votes_amount }, skip_sanitization: true }
      end

      def picks_lambda(phase)
        # We want the n of times each idea was selected (by a unique user), not the total votes or budget allocated
        # to each idea (ideas_phase.votes_count)
        lambda { |i|
          i.baskets_ideas.select do |baskets_idea|
            baskets_idea.basket[:phase_id] == phase.id && baskets_idea.basket[:submitted_at].present?
          end.size
        }
      end
    end
  end
end
