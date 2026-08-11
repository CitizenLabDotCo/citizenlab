# frozen_string_literal: true

# Stamps a top-level `related_gids` array into every job's serialized data: all GlobalIDs
# found in the job's arguments, whether GlobalID-serialized ActiveRecord objects or plain
# `gid://` strings embedded in denormalized payloads. Que stores the serialized hash as
# `que_jobs.args[0]`, so the gids become queryable with an indexed `@>` containment query
# (see `QueJob.all_related_to_gid`), which is what allows queued jobs to be purged when
# the record they reference is destroyed (see `PurgesRelatedQueJobs`).
module ActiveJobRelatedGidsExtension
  def serialize
    data = super
    gids = collect_related_gids(data['arguments']).uniq
    gids.empty? ? data : data.merge('related_gids' => gids)
  end

  private

  def collect_related_gids(value)
    case value
    when Hash then value.values.flat_map { |nested| collect_related_gids(nested) }
    when Array then value.flat_map { |nested| collect_related_gids(nested) }
    when String then value.start_with?('gid://') ? [value] : []
    else []
    end
  end
end
