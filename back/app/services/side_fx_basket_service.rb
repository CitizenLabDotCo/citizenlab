# frozen_string_literal: true

class SideFxBasketService
  include SideFxHelper

  def after_create(basket, user)
    LogActivityJob.perform_later(basket, 'created', user, basket.created_at.to_i)
    update_basket_counts basket unless basket.submitted_at.nil?
  end

  def after_update(basket, user)
    LogActivityJob.perform_later(basket, 'changed', user, basket.updated_at.to_i)
    update_basket_counts basket if basket.submitted_at_previously_changed?
  end

  def after_destroy(frozen_basket, user)
    serialized_basket = clean_time_attributes(frozen_basket.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_basket), 'deleted',
      user, Time.now.to_i,
      payload: { basket: serialized_basket }
    )
    update_basket_counts frozen_basket
  end

  def update_basket_counts(basket)
    # NOTE: we cannot use counter_culture because we can't trigger it from another model being updated (basket)
    project = basket.participation_context.project

    # Update ideas
    update_ideas_counts('ideas', project.id)

    if basket.participation_context_type == 'Phase'
      phase = basket.participation_context
      # Update ideas_phases
      update_ideas_counts('ideas_phases', project.id, phase.id)

      # Update the phase
      update_participation_context_counts(phase, phase)

      # Update the project
      update_participation_context_counts(project.phases, project)
    else
      # Update the project only
      update_participation_context_counts(project, project)
    end
  end

  private

  # NOTE: All ideas on the project are updated in case ideas have been removed from a basket or a basket is unpublished
  def update_ideas_counts(table, project_id, phase_id = nil)
    table_id = table == 'ideas' ? 'id' : 'idea_id'
    query = "
      UPDATE #{table}
      SET
        baskets_count = counts.baskets_count,
        votes_count = COALESCE(counts.votes_count, 0)
      FROM (
        SELECT
          i.id AS idea_id,
          COUNT(b.id) AS baskets_count,
          SUM(CASE WHEN b.id IS NOT NULL THEN bi.votes END) AS votes_count
        FROM ideas i
        LEFT OUTER JOIN baskets_ideas bi ON i.id = bi.idea_id
        LEFT OUTER JOIN baskets b ON bi.basket_id = b.id AND b.submitted_at IS NOT NULL"
    query += " AND b.participation_context_id = '#{phase_id}'" if phase_id
    query += "
        WHERE i.project_id = '#{project_id}'
        GROUP BY i.id
      ) AS counts
      WHERE #{table}.#{table_id} = counts.idea_id
    "
    query += " AND #{table}.phase_id = '#{phase_id}'" if phase_id
    ActiveRecord::Base.connection.execute(query)
  end

  def update_participation_context_counts(count_contexts, update_context)
    baskets = Basket.where(participation_context: count_contexts).where.not(submitted_at: nil)
    baskets_count = baskets.count
    votes_count = BasketsIdea.where(basket: baskets).sum(:votes)
    update_context.update!(baskets_count: baskets_count, votes_count: votes_count)
  end
end
