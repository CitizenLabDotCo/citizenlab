class InitiativesCountCalculator < ApplicationCalculator
  def initialize(iniatives, counts: [])
    @initiatives = iniatives
    @counts = counts.map { |count_key| [count_key, {}] }.to_h
  end

  def calculate
    @initiatives
      .joins('FULL OUTER JOIN initiatives_topics ON initiatives_topics.initiative_id = initiatives.id')
      .joins('FULL OUTER JOIN areas_initiatives ON areas_initiatives.initiative_id = initiatives.id')
      .joins('FULL OUTER JOIN initiative_initiative_statuses ON initiative_initiative_statuses.initiative_id = initiatives.id')
      .select('initiative_initiative_statuses.initiative_status_id, areas_initiatives.area_id, initiatives_topics.topic_id, COUNT(DISTINCT(initiatives.id)) as count')
      .reorder(nil)  # Avoids SQL error on GROUP BY when a search string was used
      .group('GROUPING SETS (initiative_initiative_statuses.initiative_status_id, areas_initiatives.area_id, initiatives_topics.topic_id)')
      .each do |record|
        @counts.keys.each do |attribute|
          id = record.send attribute
          @counts[attribute] ||= {}
          @counts[attribute][id] = record.count if id
        end
      end
    @counts[:total] = @initiatives.count

    result.counts = @counts
  end
end
