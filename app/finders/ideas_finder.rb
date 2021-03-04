# frozen_string_literal: true

## IdeasFinder.find
class IdeasFinder < ApplicationFinder
  sortable_attributes 'upvotes_count', 'downvotes_count', 'baskets_count'

  sort_scope 'new',          order_new: :desc
  sort_scope '-new',         order_new: :asc
  sort_scope 'popular',      order_popular: :desc
  sort_scope '-popular',     order_popular: :asc
  sort_scope 'random',       :order_random
  sort_scope 'author_name',  ['users.first_name ASC', 'users.last_name ASC']
  sort_scope '-author_name', ['users.first_name DESC', 'users.last_name DESC']
  sort_scope 'status',       order_status: :asc
  sort_scope '-status',      order_status: :desc
  sort_scope 'trending',     ->(ideas) { TrendingIdeaService.new.sort_trending(ideas) }
  sort_scope '-trending',    ->(ideas) { TrendingIdeaService.new.sort_trending(ideas).reverse }

  private

  def ideas_condition(ids)
    where(id: ids)
  end

  def projects_condition(project_ids)
    where(project_id: project_ids)
  end

  def topics_condition(topics)
    return if topics.blank?

    @records.includes(:topics)
    scope(:with_some_topics, topics)
  end

  def areas_condition(areas)
    return if areas.blank?

    @records.includes(:areas)
    scope(:with_some_areas, areas)
  end

  def phase_condition(phase)
    scope(:in_phase, phase) if phase.present?
  end

  def idea_status_condition(idea_status)
    where(idea_status_id: idea_status)
  end

  def project_publication_status_condition(project_publication_status)
    scope(:with_project_publication_status, project_publication_status) if project_publication_status.present?
  end

  def feedback_needed_condition(feedback_needed)
    feedback_needed ? scope(:feedback_needed) : scope(:no_feedback_needed)
  end

  def search_condition(search)
    _search_restricted? ? scope(:search_by_all, search) : scope(:restricted_search, search)
  end

  def filter_trending_condition(filter_trending)
    filter_trending && filter_records { TrendingIdeaService.new.filter_trending(@records) }
  end

  def author_condition(author)
    @records.includes(:author)
    where(author_id: author)
  end

  def publication_status_condition(publication_status)
    publication_status ? where(publication_status: publication_status) : where(publication_status: 'published')
  end

  def bounding_box_condition(bounding_box)
    scope(:with_bounding_box, bounding_box) if bounding_box.present?
  end

  def _search_restricted?
    UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
  end
end

IdeasFinder.include_if_ee('IdeaAssignment::Extensions::IdeasFinder')
