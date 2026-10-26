# frozen_string_literal: true

module Seo
  class ApplicationController < ActionController::Base
    include OutletRenderer

    protect_from_forgery with: :exception

    before_action :set_host

    layout false

    def sitemap
      @projects = Pundit.policy_scope(nil, Project)
        .joins(:admin_publication)
        .where(listed: true)
        .select(
          :'projects.id', :'projects.slug', :'projects.visible_to',
          :'projects.updated_at', :'admin_publications.publication_status',
          :'admin_publications.publication_type', :'admin_publications.publication_id'
        )

      @folders = Pundit.policy_scope(nil, ProjectFolders::Folder)
        .joins(:admin_publication)
        .select(
          :'project_folders_folders.id', :'project_folders_folders.slug',
          :'project_folders_folders.updated_at', :'admin_publications.publication_status',
          :'admin_publications.publication_type', :'admin_publications.publication_id'
        )

      @ideas = Pundit.policy_scope(nil, Idea)
        .where(project_id: @projects.map(&:id))
        .select(:slug, :updated_at, :project_id)

      @pages = Pundit.policy_scope(nil, StaticPage).select(:slug, :updated_at)

      @phases_by_project_id = Phase
        .where(project_id: @projects.map(&:id))
        .select(:id, :project_id, :updated_at, :start_at)
        .order(:start_at)
        .group_by(&:project_id)
    end

    def robots; end

    private

    def set_host
      @host = AppConfiguration.instance.host
    end
  end
end
