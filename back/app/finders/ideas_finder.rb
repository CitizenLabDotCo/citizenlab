# frozen_string_literal: true

class IdeasFinder < ApplicationFinder
  def initialize(params, scope: nil, includes: [], current_user: nil)
    scope ||= _base_scope
    super(
      params,
      scope: scope.publicly_visible,
      includes: includes,
      current_user: current_user
    )
  end

  private

  def ideas_condition(ids)
    where(id: ids)
  end

  def transitive_condition(transitive)
    transitive ? records.transitive : records
  end

  def projects_condition(project_ids)
    where(project_id: project_ids)
  end

  def project_condition(project_id)
    where(project_id: project_id)
  end

  def basket_id_condition(basket_id)
    records.joins(:baskets).where('baskets.id': basket_id)
  end

  def topics_condition(topics)
    return if topics.blank?

    @records.includes(:topics)
    scope(:with_some_topics, topics)
  end
  alias topic_condition topics_condition

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
    scope(:feedback_needed) if feedback_needed
  end

  def with_content_condition(with_content)
    with_content ? records.with_content : records
  end

  def search_condition(search)
    _search_restricted? ? scope(:search_by_all, search) : scope(:restricted_search, search)
  end

  def filter_trending_condition(filter_trending)
    filter_trending && TrendingIdeaService.new.filter_trending(@records)
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

  def group_condition(group_id)
    group = Group.find(group_id)
    records.joins(:author).where(author: group.members)
  end

  def _search_restricted?
    UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
  end

  def location_required_condition(location_required)
    return unless location_required

    @records.where.not(location_point: nil)
  end

  def filter_can_moderate_condition(can_moderate)
    return unless can_moderate

    if current_user
      where(project: user_role_service.moderatable_projects(current_user))
    else
      records.none
    end
  end

  def user_role_service
    @user_role_service ||= UserRoleService.new
  end
end

IdeasFinder.include(IdeaAssignment::Extensions::IdeasFinder)
