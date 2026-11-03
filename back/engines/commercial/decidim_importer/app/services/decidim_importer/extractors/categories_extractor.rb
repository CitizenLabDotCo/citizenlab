# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim categories (`03---categories.csv`) ──▶ Go Vocal `InputTopic` on the process's project.
    #
    # Each becomes a project-scoped input topic. `InputTopic` allows only one level of nesting (root +
    # direct children), so the Decidim hierarchy is flattened to fit: a non-root category is re-parented
    # onto its top-level root ancestor, collapsing any 3+-level Decidim tree to two levels. Rows are
    # processed roots-first so the ancestor exists when a child references it. Runs after the projects
    # extractor; the process is stamped by {ExportReader} (the CSV has no process column).
    class CategoriesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        parent: 'parent',
        name: 'name',
        description: 'description',
        weight: 'weight',
        process: 'decidim_participatory_process'
      }.freeze

      def run
        rows.sort_by { |row| sort_key(row) }.filter_map { |row| build_topic(row) }
      end

      private

      # Roots (no parent) before children, then by Decidim weight, then uid for a stable order.
      def sort_key(row)
        root = present_value(row[COLUMNS[:parent]]) ? 1 : 0
        [root, present_value(row[COLUMNS[:weight]]).to_i, present_value(row[COLUMNS[:uid]]).to_s]
      end

      def build_topic(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        return skip(uid, 'no project for category') if project.nil?

        title = multiloc(row[COLUMNS[:name]])
        return skip(uid, 'category has no name') if title.empty?

        topic = Record.new('input_topic', {
          'title_multiloc' => title,
          'description_multiloc' => multiloc(row[COLUMNS[:description]])
        })
        topic.reference('project', project)
        reference_parent(topic, row)
        ref_map.register(uid, topic)
      end

      # Attaches the topic to its top-level root ancestor (not its direct Decidim parent), so a category
      # nested 3+ levels deep still lands at depth 1 — the deepest `InputTopic` allows.
      def reference_parent(topic, row)
        uid = present_value(row[COLUMNS[:uid]])
        root_uid = root_ancestor_uid(uid)
        return if root_uid == uid # the category is itself a root

        parent = ref_map.fetch(root_uid)
        topic.reference('parent', parent) if parent&.model_name == 'input_topic'
      end

      # The uid of `uid`'s top-level ancestor by walking the Decidim `parent` chain (itself when it has
      # no parent). Stops if a uid repeats, so a malformed cycle can't loop forever.
      def root_ancestor_uid(uid)
        seen = Set.new
        current = uid
        current = parent_by_uid[current] while parent_by_uid[current] && seen.add?(current)
        current
      end

      # uid → parent uid, for every category row that has a parent.
      def parent_by_uid
        @parent_by_uid ||= rows.each_with_object({}) do |row, map|
          uid = present_value(row[COLUMNS[:uid]])
          parent = present_value(row[COLUMNS[:parent]])
          map[uid] = parent if uid && parent
        end
      end
    end
  end
end
