# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Repairs the copies an admin made of old inputs with the input importer, when several old
      # phases were merged into a new one (TAN-9037). The importer left behind the author (it
      # created a placeholder user, or none), the images, the follows and the comments; this puts
      # each of them back from the source input.
      #
      # The importer keeps no link to the source input, so each imported copy is matched to a source
      # by title. When titles repeat, the author's name, the publication date and the body narrow it
      # down. A copy that does not end up with exactly one source of its own is reported and skipped.
      #
      # Nothing goes through the SideFx services: this is old participation moving house, so nobody
      # must be notified and no activity logged, except for the deletion of the placeholder users.
      # Re-running the repairer skips what an earlier run already did.
      class ConsolidatedInputsRepairer
        COPIED_COMMENT_ATTRIBUTES = %w[
          author_id author_hash anonymous body_multiloc publication_status created_at updated_at body_updated_at
        ].freeze
        COPIED_REACTION_ATTRIBUTES = %w[user_id mode created_at updated_at].freeze

        # The author is compared by name because the copies still carry the importer's placeholder
        # user, named after the real author. The importer adds the current time to the imported
        # publication date, so only the day can match.
        TIE_BREAKERS = [
          ->(idea) { idea.author&.full_name },
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
            match(target_phase, source_phase_ids).each { |source, copy| repair(source, copy) }
            ParticipantsService.new.clear_project_participants_count_cache(target_phase.project) if @execute
          end
          UpdateMemberCountJob.perform_later if @execute && counts[:ghosts_deleted].positive?
          counts
        end

        # Returns [source, copy] pairs. Only imported copies are considered: the others were posted
        # in the target phase directly and have no source.
        def match(target_phase, source_phase_ids)
          copies = target_phase.ideas.where(id: BulkImportIdeas::IdeaImport.select(:idea_id)).includes(:author)
          sources = Idea.joins(:ideas_phases).where(ideas_phases: { phase_id: source_phase_ids }).distinct.includes(:author)
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

        # Everything is reported only once the transaction has committed, so that the report, which
        # is what an undo works from, never lists rows that were rolled back. Images and the
        # placeholder user come after the commit: an image download can fail on its own, and the
        # placeholder must only go once its copy has the real author.
        def repair(source, copy)
          log = []
          replaced_author = nil
          Idea.transaction do
            replaced_author = fix_author(source, copy, log)
            copy_author_reaction(source, copy, log)
            copy_followers(source, copy, log)
            copy_comments(source, copy, log)
          end
          log.each { |entry| record(**entry) }
          copy_images(source, copy)
          delete_ghost(replaced_author, copy) if replaced_author
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

            copy_value = value_of.call(copy)
            next if copy_value.nil?

            narrowed = sources.select { |source| value_of.call(source) == copy_value }
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

        def record(kind:, model:, count:, attributes: nil, old_value: nil, new_value: nil, id: nil, context: {})
          counts[count] += 1
          case kind
          when :create then @reporter.add_create(model, attributes, context: context)
          when :change then @reporter.add_change(old_value, new_value, context: context)
          when :delete then @reporter.add_delete(model, id, context: context)
          end
        end

        # Returns the author the copy had before, when it had one and it was replaced.
        #
        # The source's hash can be reused as is: a named author's hash does not depend on the
        # project, and an anonymous one cannot be recomputed without the author.
        def fix_author(source, copy, log)
          target = source.slice(:author_id, :anonymous, :author_hash).symbolize_keys
          current = copy.slice(:author_id, :anonymous, :author_hash).symbolize_keys
          return if current == target

          replaced_author = copy.author
          copy.update_columns(target) if @execute
          log << {
            kind: :change, model: 'Idea', count: source.anonymous ? :made_anonymous : :authors_fixed,
            old_value: current, new_value: target, context: { copy_id: copy.id, source_id: source.id }
          }
          replaced_author
        end

        # The like an author gives their own input on submission, which the importer did not replay.
        def copy_author_reaction(source, copy, log)
          return if source.author_id.nil?

          reaction = source.reactions.find_by(user_id: source.author_id)
          return if reaction.nil? || copy.reactions.exists?(user_id: source.author_id)

          copied_reaction = copy.reactions.create!(reaction.attributes.slice(*COPIED_REACTION_ATTRIBUTES)) if @execute
          log << {
            kind: :create, model: 'Reaction', count: :author_reactions,
            attributes: { id: copied_reaction&.id, source_id: reaction.id, idea_id: copy.id }
          }
        end

        # Each image is downloaded and saved on its own, so a broken URL costs only that image. The
        # dry run tries the download too, without saving, so broken URLs show up before the real run.
        def copy_images(source, copy)
          return if copy.idea_images.exists?

          source.idea_images.each do |image|
            copied_image = IdeaImage.new(idea: copy, remote_image_url: image.image_url, ordering: image.ordering)
            if @execute ? copied_image.save : copied_image.valid?
              record(kind: :create, model: 'IdeaImage', count: :images, attributes: { id: copied_image.id, source_id: image.id, idea_id: copy.id })
            else
              image_not_copied(image, copy, copied_image.errors.full_messages.join(', '))
            end
          rescue StandardError => e
            image_not_copied(image, copy, "#{e.class}: #{e.message}")
          end
        end

        def image_not_copied(image, copy, reason)
          counts[:images_failed] += 1
          @reporter.add_error("Image not copied: #{reason}", context: { source_image_id: image.id, copy_id: copy.id })
        end

        # Authors and commenters are notified through the follows of the input, not as such.
        def copy_followers(source, copy, log)
          source.followers.each do |follower|
            next if copy.followers.exists?(user_id: follower.user_id)

            copied_follower = copy.followers.create!(user_id: follower.user_id) if @execute
            log << {
              kind: :create, model: 'Follower', count: :followers,
              attributes: { id: copied_follower&.id, user_id: follower.user_id, idea_id: copy.id }
            }
          end
        end

        def copy_comments(source, copy, log)
          comments = source.comments.order(:lft).to_a
          copied = {}
          comments.each do |comment|
            copied_comment = find_copied_comment(copy, comment) || create_comment(copy, comment, copied[comment.parent_id]&.id, log)
            copied[comment.id] = copied_comment
            copy_reactions(comment, copied_comment, log)
          end
          restore_dates(comments, copied)
        end

        def find_copied_comment(copy, comment)
          copy.comments.find_by(comment.slice(:author_id, :author_hash, :created_at))
        end

        # In a dry run nothing is created, so the replies of a new comment get a nil parent there.
        def create_comment(copy, comment, parent_id, log)
          attributes = comment.attributes.slice(*COPIED_COMMENT_ATTRIBUTES).merge('idea_id' => copy.id, 'parent_id' => parent_id)
          copied_comment = Comment.create!(attributes) if @execute
          log << {
            kind: :create, model: 'Comment', count: :comments,
            attributes: { id: copied_comment&.id, source_id: comment.id, idea_id: copy.id }, context: { source_idea_id: comment.idea_id }
          }
          copied_comment
        end

        def copy_reactions(comment, copied_comment, log)
          comment.reactions.order(:created_at).each do |reaction|
            next if copied_comment && reaction_copied?(copied_comment, reaction)

            copied_reaction = copied_comment.reactions.create!(reaction.attributes.slice(*COPIED_REACTION_ATTRIBUTES)) if @execute
            log << {
              kind: :create, model: 'Reaction', count: :reactions,
              attributes: { id: copied_reaction&.id, source_id: reaction.id, comment_id: copied_comment&.id }, context: { source_comment_id: comment.id }
            }
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

        # Only the placeholder user this run has just replaced is deleted, and only while it is an
        # empty shell: the `user_created` flag stays on the import after the fix, so it alone cannot
        # tell a placeholder from the real author.
        def delete_ghost(user, copy)
          return unless BulkImportIdeas::IdeaImport.exists?(idea_id: copy.id, user_created: true)

          unless empty_shell?(user, copy)
            @reporter.add_error('Skipped: placeholder user kept, not an empty shell', context: { user_id: user.id, copy_id: copy.id })
            counts[:ghosts_kept] += 1
            return
          end

          DeleteUserJob.perform_now(user, update_member_counts: false) if @execute
          record(kind: :delete, model: 'User', count: :ghosts_deleted, id: user.id, context: { copy_id: copy.id })
        rescue StandardError => e
          @reporter.add_error("#{e.class}: #{e.message}", context: { user_id: user.id, copy_id: copy.id })
        end

        def empty_shell?(user, copy)
          user.email.blank? && user.password_digest.blank? && !user.identities.exists? &&
            !user.ideas.where.not(id: copy.id).exists? &&
            !user.comments.exists? && !user.reactions.exists? && !user.baskets.exists?
        end
      end
    end
  end
end
