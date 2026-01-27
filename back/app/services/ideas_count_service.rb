module IdeasCountService
  ATTRIBUTE_JOIN_TABLES = {
    'input_topic_id' => 'ideas_input_topics'
  }

  def self.counts(ideas_scope, attributes = %w[idea_status_id input_topic_id])
    result = attributes.index_with { {} }

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
          id = record.send(attribute)
          result[attribute][id] = record.count if id
        end
      end

    aggregate_child_input_topic_counts(result) if attributes.include?('input_topic_id')

    result
  end

  # Adds child topic counts to their parent topic counts.
  # Can be called with either:
  # - A result hash from counts() method: aggregate_child_input_topic_counts(result)
  # - A simple topic_id => count hash: aggregate_child_input_topic_counts(counts_hash)
  def self.aggregate_child_input_topic_counts(input)
    input_topic_counts = input.is_a?(Hash) && input.key?('input_topic_id') ? input['input_topic_id'] : input
    return input_topic_counts if input_topic_counts.blank?

    InputTopic.where(id: input_topic_counts.keys, depth: 1).each do |child|
      parent_id = child.parent_id
      next unless parent_id

      child_count = input_topic_counts[child.id] || 0
      input_topic_counts[parent_id] = (input_topic_counts[parent_id] || 0) + child_count
    end

    input_topic_counts
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
