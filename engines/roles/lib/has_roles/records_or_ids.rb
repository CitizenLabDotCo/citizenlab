module HasRoles
  class RecordsOrIds
    attr_reader :records_or_ids

    def self.map_ids(*records_or_ids, &blk)
      new(records_or_ids).map_ids(&blk)
    end

    def initialize(*records_or_ids)
      records_or_ids.flatten! if records_or_ids.first.is_a?(Array)

      @records_or_ids = records_or_ids
    end

    def ids
      @ids ||= records_or_ids.flatten.map do |record_or_id|
        if record_or_id.is_a?(::ActiveRecord::Base)
          record_or_id.id
        elsif record_or_id.is_a?(String) || record_or_id.is_a?(Integer)
          record_or_id
        end
      end.uniq.compact
    end

    def records(klass = nil)
      @records ||= records_or_ids.partition { |r| r.is_a?(::ActiveRecord::Base) }.yield_self do |(records, ids)|
        records.concat(klass.where(id: ids)) if klass
        records
      end
    end

    def include?(other_records_or_ids)
      other_ids = self.class.new(other_records_or_ids).ids

      (ids & other_ids) == other_ids
    end

    def map_ids(&blk)
      ids.map(&blk)
    end
  end
end
