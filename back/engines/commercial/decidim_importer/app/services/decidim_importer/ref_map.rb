# frozen_string_literal: true

module DecidimImporter
  # Registry of intermediate records keyed by the Decidim `"<table>-<id>"` string (the unique join
  # key agreed in migration planning, since Decidim uses bigint PKs that don't survive the move to
  # UUIDs). Lets any extractor resolve a cross-file reference (e.g. a step's
  # `decidim_participatory_processes-5`) to the record that was registered for it.
  class RefMap
    def self.key(table, id)
      "#{table}-#{id}"
    end

    def initialize
      @by_key = {}
      @ordered = []
    end

    # @return [DecidimImporter::Record] the registered record (for chaining).
    def register(table, id, record)
      key = self.class.key(table, id)
      raise ArgumentError, "duplicate ref key: #{key}" if @by_key.key?(key)

      record.key = key
      @by_key[key] = record
      @ordered << record
      record
    end

    def fetch(table, id)
      @by_key[self.class.key(table, id)]
    end

    def fetch_by_key(key)
      @by_key[key]
    end

    # All records in registration order. Insertion order within a model is preserved by the
    # template builder and matched by the deserializer's per-model creation order.
    def records
      @ordered
    end
  end
end
