# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Copies the comments, replies and comment likes/dislikes of old inputs onto the copies an
      # admin made of them with the input importer, when several old phases were merged into a new
      # one (TAN-9037).
      #
      # The importer keeps no link to the source input, so each imported copy is matched to a source
      # by title. When titles repeat, the author, the publication date and the body narrow it down.
      # A copy that does not end up with exactly one source of its own is reported and skipped.
      #
      # Comments and reactions are created without their SideFx services: this is old participation
      # moving house, so nobody must be notified and no activity logged. Re-running the copier skips
      # what an earlier run already created.
      class ConsolidatedInputsRepairer
        COPIED_COMMENT_ATTRIBUTES = %w[
          author_id author_hash anonymous body_multiloc publication_status created_at updated_at body_updated_at
        ].freeze
        COPIED_REACTION_ATTRIBUTES = %w[user_id mode created_at updated_at].freeze

        # The importer adds the current time to the imported publication date, so only the day can
        # match.
        TIE_BREAKERS = [
          ->(idea) { idea.author_id },
          ->(idea) { idea.published_at&.to_date },
          ->(idea) { idea.body_multiloc }
        ].freeze

        attr_reader :counts

        # `map`: target phase id => ids of the source phases whose inputs were imported into it.
        def initialize(map, reporter:, execute:)
          @map = map
          @reporter = reporter
          @execute = execute
          @counts = Hash.new(0)
        end

        def run
          @map.each do |target_phase_id, source_phase_ids|
            target_phase = Phase.find(target_phase_id)
            match(target_phase, source_phase_ids).each { |source, copy| copy_comments(source, copy) }
            ParticipantsService.new.clear_project_participants_count_cache(target_phase.project) if @execute
          end
          counts
        end

        # Returns [source, copy] pairs. Only imported copies are considered: the others were posted
        # in the target phase directly and have no source.
        def match(target_phase, source_phase_ids)
          copies = target_phase.ideas.where(id: BulkImportIdeas::IdeaImport.select(:idea_id))
          sources = Idea.joins(:ideas_phases).where(ideas_phases: { phase_id: source_phase_ids }).distinct
          sources_by_title = sources.group_by { |idea| title_key(idea) }

          candidates = copies.index_with { |copy| pick_source(copy, sources_by_title.fetch(title_key(copy), [])) }
          claims = candidates.values.compact.tally

          candidates.filter_map do |copy, source|
            if source.nil?
              skip(copy, 'no single source matches this copy')
            elsif claims[source] > 1
              skip(copy, "source #{source.id} matches several copies")
            else
              counts[:pairs] += 1
              [source, copy]
            end
          end
        end

        # Creations are reported only once the transaction has committed, so that the report, which
        # is what an undo works from, never lists rows that were rolled back.
        def copy_comments(source, copy)
          creates = []
          Comment.transaction do
            comments = source.comments.order(:lft).to_a
            copied = {}
            comments.each do |comment|
              copied_comment = find_copied_comment(copy, comment) || create_comment(copy, comment, copied[comment.parent_id]&.id, creates)
              copied[comment.id] = copied_comment
              copy_reactions(comment, copied_comment, creates)
            end
            restore_dates(comments, copied)
          end
          creates.each do |model_name, attributes, context|
            counts[model_name == 'Comment' ? :comments : :reactions] += 1
            @reporter.add_create(model_name, attributes, context: context)
          end
        rescue StandardError => e
          @reporter.add_error("#{e.class}: #{e.message}", context: { source_id: source.id, copy_id: copy.id })
        end

        private

        def title_key(idea)
          idea.title_multiloc.values.map { |title| title.to_s.downcase.squish }.sort
        end

        def pick_source(copy, sources)
          TIE_BREAKERS.each do |value_of|
            break if sources.size <= 1

            narrowed = sources.select { |source| value_of.call(source) == value_of.call(copy) }
            # The importer may not have carried this value over: an empty result says nothing.
            sources = narrowed if narrowed.any?
          end
          sources.first if sources.size == 1
        end

        def skip(copy, reason)
          counts[:skipped] += 1
          @reporter.add_error("Skipped: #{reason}", context: { copy_id: copy.id, title: copy.title_multiloc.values.first })
          nil
        end

        def find_copied_comment(copy, comment)
          copy.comments.find_by(comment.slice(:author_id, :author_hash, :created_at))
        end

        # In a dry run nothing is created, so the replies of a new comment get a nil parent there.
        def create_comment(copy, comment, parent_id, creates)
          attributes = comment.attributes.slice(*COPIED_COMMENT_ATTRIBUTES).merge('idea_id' => copy.id, 'parent_id' => parent_id)
          copied_comment = Comment.create!(attributes) if @execute
          creates << ['Comment', { id: copied_comment&.id, source_id: comment.id, idea_id: copy.id }, { source_idea_id: comment.idea_id }]
          copied_comment
        end

        def copy_reactions(comment, copied_comment, creates)
          comment.reactions.order(:created_at).each do |reaction|
            next if copied_comment && reaction_copied?(copied_comment, reaction)

            copied_reaction = copied_comment.reactions.create!(reaction.attributes.slice(*COPIED_REACTION_ATTRIBUTES)) if @execute
            creates << ['Reaction', { id: copied_reaction&.id, source_id: reaction.id, comment_id: copied_comment&.id }, { source_comment_id: comment.id }]
          end
        end

        def reaction_copied?(copied_comment, reaction)
          scope = copied_comment.reactions.where(user_id: reaction.user_id, mode: reaction.mode)
          scope = scope.where(created_at: reaction.created_at) if reaction.user_id.nil?
          scope.exists?
        end

        # Creating a reply touches its parent, which may have been copied by an earlier run, so the
        # dates of the whole thread are put back once it is complete.
        def restore_dates(comments, copied)
          return unless @execute

          comments.each { |comment| copied[comment.id].update_column(:updated_at, comment.updated_at) }
        end
      end
    end
  end
end
