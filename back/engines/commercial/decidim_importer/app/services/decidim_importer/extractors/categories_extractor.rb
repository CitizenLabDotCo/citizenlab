# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim categories (`03---categories.csv`) ──▶ Go Vocal `InputTopic` on the process's project.
    #
    # Each becomes a project-scoped input topic, preserving the Decidim hierarchy: a category with a
    # `parent` references the parent's input topic. `InputTopic` is a nested set (max depth 2), so rows
    # are processed roots-first — the parent exists when a child references it. Runs after the projects
    # extractor. The process is stamped by {ExportReader} (the CSV has no process column).
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

      def reference_parent(topic, row)
        parent_uid = present_value(row[COLUMNS[:parent]])
        return if parent_uid.nil?

        parent = ref_map.fetch(parent_uid)
        topic.reference('parent', parent) if parent&.model_name == 'input_topic'
      end
    end
  end
end
