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
      return 0 if assignments.empty?

      needed_keys = assignments.flat_map { |a| [a[:user_key], a[:target_key]] }.compact.to_set
      index = build_id_index(created_object_ids, needed_keys)
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

    # Maps each *needed* record key (a Decidim uid) to the new database id it was assigned. Only the
    # models owning a needed key are correlated — so legitimately-pruned models (files, images) are
    # ignored rather than tripping the count check below. For a correlated model, the positional zip is
    # valid only when the deserializer created exactly the records we emitted, in order: a count
    # mismatch means that broke and every subsequent id would map to the wrong record, so we fail
    # loudly rather than silently assign a moderator role to the wrong project.
    def build_id_index(created_object_ids, needed_keys)
      index = {}
      @ref_map.records.group_by(&:model_name).each do |model_name, records|
        next unless records.any? { |record| needed_keys.include?(record.key) }

        ids = created_object_ids[model_name.classify] || []
        if ids.size != records.size
          raise "RoleAssigner: deserializer created #{ids.size} #{model_name} record(s) but the " \
                "template emitted #{records.size}; cannot reliably correlate role targets"
        end

        records.each_with_index { |record, i| index[record.key] = ids[i] if record.key }
      end
      index
    end
  end
end
