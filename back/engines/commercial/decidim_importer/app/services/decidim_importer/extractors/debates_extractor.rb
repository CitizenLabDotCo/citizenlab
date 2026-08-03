# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim debates (`04---debates.csv`) ──▶ Go Vocal `Idea` in an ideation phase — the same shape as
    # {ProposalsExtractor}: the debates component already became a phase via {PhaseProjector} (registered
    # under the component uid), and the idea surfaces in it through the `ideas_phase` join.
    #
    # A debate carries three rich-text fields an `Idea` has no home for — `instructions`,
    # `information_updates` and `conclusions`. Rather than drop them, each non-empty one is folded into the
    # idea body under an `<h3>` heading (`decidim_importer.debate_*`), after the description.
    #
    # Debate comments and followers land in the shared `:comments`/`:followers` streams (identical columns
    # to proposals'), so {CommentsExtractor}/{FollowersExtractor} handle them once the debate is an idea.
    class DebatesExtractor < BaseExtractor
      include IdeaAssociations

      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        author: 'author',
        category: 'category',
        title: 'title',
        description: 'description',
        instructions: 'instructions',
        information_updates: 'information_updates',
        conclusions: 'conclusions',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      # Debate-only rich-text fields folded into the idea body, in order, each under its own heading.
      BODY_SECTIONS = %i[instructions information_updates conclusions].freeze

      def run
        rows.filter_map { |row| build_idea(row) }
      end

      private

      def build_idea(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        phase = ref_map.fetch(present_value(row[COLUMNS[:component]]))
        return skip(uid, 'no project/phase for debate') if project.nil? || phase.nil?

        title = multiloc(row[COLUMNS[:title]])
        return skip(uid, 'debate has no title') if title.empty?

        idea = Record.new('idea', idea_attributes(row, title))
        idea.reference('project', project)
        # Ideation is transitive: the idea links to its phase only through the ideas_phase join below.
        author = author_record(row)
        idea.reference('author', author) if author
        ref_map.register(uid, idea)

        register_ideas_phase(uid, idea, phase)
        register_input_topic(uid, idea, row[COLUMNS[:category]])
        idea
      end

      def idea_attributes(row, title)
        # Debates carry no `published_at`; date the idea by its creation (as the export gives no draft
        # state, every debate is treated as published).
        created = timestamp(row[COLUMNS[:created_at]])
        {
          'title_multiloc' => title,
          'body_multiloc' => body_multiloc(row),
          'publication_status' => 'published',
          'created_at' => created,
          'published_at' => created,
          'submitted_at' => created,
          'updated_at' => timestamp(row[COLUMNS[:updated_at]]),
          'idea_status_code' => IdeaStatuses.code_for_state_token(nil) # debates have no state → 'proposed'
        }
      end

      # The description followed by each non-empty debate-only section under an `<h3>` heading, per locale.
      def body_multiloc(row)
        description = multiloc(row[COLUMNS[:description]])
        sections = BODY_SECTIONS.index_with { |key| multiloc(row[COLUMNS[key]]) }
        locales = (description.keys + sections.values.flat_map(&:keys)).uniq
        headings = BODY_SECTIONS.index_with { |key| i18n_multiloc("debate_#{key}", locales: locales) }

        locales.index_with { |locale| compose_body(locale, description, sections, headings) }
          .compact_blank
      end

      def compose_body(locale, description, sections, headings)
        parts = []
        parts << description[locale] if description[locale].present?
        BODY_SECTIONS.each do |key|
          content = sections[key][locale]
          next if content.blank?

          heading = headings[key][locale]
          parts << "<h3>#{heading}</h3>" if heading.present?
          parts << content
        end
        parts.join
      end

      # Decidim `author` is a single uid; keep it only when it resolved to an imported user, else the idea
      # is author-less (Go Vocal allows `Idea#author` to be nil).
      def author_record(row)
        record = ref_map.fetch(present_value(row[COLUMNS[:author]]))
        record if record&.model_name == 'user'
      end
    end
  end
end
