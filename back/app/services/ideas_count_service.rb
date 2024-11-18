module IdeasCountService
  SUPPORTED_ATTRIBUTES = %w[idea_status_id topic_id]
  ATTRIBUTE_JOIN_TABLES = {
    'topic_id' => 'ideas_topics'
  }

  def self.counts(ideas_scope, attributes = SUPPORTED_ATTRIBUTES)
    result = SUPPORTED_ATTRIBUTES.map { |attribute| [attribute, {}] }.to_h

    attributes.each do |attribute|
      join_table = ATTRIBUTE_JOIN_TABLES[attribute]
      next if !join_table

      ideas_scope = ideas_scope.joins("FULL OUTER JOIN #{join_table} ON #{join_table}.idea_id = ideas.id")
    end

    ideas_scope
      .select("#{column_names(attributes).join(', ')}, COUNT(DISTINCT(ideas.id)) as count")
      .reorder(nil) # Avoids SQL error on GROUP BY when a search string was used
      .group("GROUPING SETS (#{column_names(attributes).join(', ')})")
      .each do |record|
      attributes.each do |attribute|
        id = record.send attribute
        result[attribute][id] = record.count if id
      end
    end

    result
  end

  def self.column_names(attributes)
    attributes.map do |attribute|
      if ATTRIBUTE_JOIN_TABLES.key? attribute
        "#{ATTRIBUTE_JOIN_TABLES[attribute]}.#{attribute}"
      else
        attribute
      end
    end
  end
end