# frozen_string_literal: true

module DecidimImporter
  # Registry of intermediate records keyed by Decidim row `uid` (e.g. `decidim-user-1`). Decidim's CSV
  # export emits the same `uid` in primary- and foreign-key columns, so it's the natural cross-file
  # join key — kept verbatim so extractors can look up a record by exactly the string found in the CSV.
  class RefMap
    def initialize
      @by_uid = {}
      @ordered = []
    end

    # @param uid [String] the Decidim row `uid`.
    # @return [DecidimImporter::Record] the registered record (for chaining).
    def register(uid, record)
      raise ArgumentError, "duplicate ref key: #{uid}" if @by_uid.key?(uid)

      record.key = uid
      @by_uid[uid] = record
      @ordered << record
      record
    end

    # Point an extra uid at an already-registered record *without* emitting it again — e.g. a second
    # Decidim account Go Vocal must collapse onto the first (they share an email). `fetch(uid)` then
    # resolves to that record, but it still appears only once in {#records}.
    def register_alias(uid, record)
      raise ArgumentError, "duplicate ref key: #{uid}" if @by_uid.key?(uid)

      @by_uid[uid] = record
    end

    def fetch(uid)
      @by_uid[uid]
    end

    # All records in registration order. Per-model insertion order is preserved by the template builder
    # and matched by the deserializer's creation order.
    def records
      @ordered
    end
  end
end
