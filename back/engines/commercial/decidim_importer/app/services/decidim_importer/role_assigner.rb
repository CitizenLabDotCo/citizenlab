# frozen_string_literal: true

module DecidimImporter
  # Applies project/folder-scoped moderator roles *after* the template has been deserialized.
  #
  # These roles can't travel inside the template: they live in the user's JSONB `roles` array as a
  # `project_id`/`project_folder_id`, and the template's ref mechanism only resolves association
  # columns and nested-attribute refs — not ids embedded in a JSON value. So we wait until the
  # records exist, then correlate each record back to its new id.
  #
  # The correlation relies on the fact that the deserializer creates records in the same per-model
  # order they appear in the template (which is the {RefMap} registration order), and returns their
  # ids per class in that order.
  class RoleAssigner
    def initialize(ref_map)
      @ref_map = ref_map
    end

    # @param created_object_ids [Hash] class-name => [id, …] in creation order (deserializer output).
    # @param assignments [Array<Hash>] tuples from {Extractors::ProcessRolesExtractor}.
    # @return [Integer] number of role assignments applied.
    def assign(created_object_ids, assignments)
      index = build_id_index(created_object_ids)
      applied = 0

      assignments.each do |assignment|
        user_id = index[assignment[:user_key]]
        target_id = index[assignment[:target_key]]
        next unless user_id && target_id

        user = ::User.find(user_id)
        user.add_role(assignment[:role], assignment[:scope_attribute] => target_id)
        user.save!
        applied += 1
      end

      applied
    end

    private

    # Maps each registered record's "<table>-<id>" key to the new database id it was assigned.
    def build_id_index(created_object_ids)
      index = {}
      @ref_map.records.group_by(&:model_name).each do |model_name, records|
        ids = created_object_ids[model_name.classify] || []
        records.each_with_index do |record, i|
          index[record.key] = ids[i] if record.key && ids[i]
        end
      end
      index
    end
  end
end
