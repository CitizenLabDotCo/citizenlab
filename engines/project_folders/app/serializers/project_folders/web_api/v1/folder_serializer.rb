module ProjectFolders
  class WebApi::V1::FolderSerializer < ::WebApi::V1::BaseSerializer

    attributes :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :created_at, :updated_at

    attribute :header_bg do |object|
      object.header_bg && object.header_bg.versions.map { |k, v| [k.to_s, v.url] }.to_h
    end

    attribute :visible_projects_count do |object, params|
      params.dig(:visible_children_count_by_parent_id, object.admin_publication.id) || Pundit.policy_scope(current_user(params), Project).where(id: object.admin_publication.children.map(&:publication_id)).count
    end

    # has_many :projects do |object|
    #   object.projects.order(:ordering)
    # end

    has_one :admin_publication, serializer: ::WebApi::V1::AdminPublicationSerializer

    has_many :images, serializer: ::WebApi::V1::ImageSerializer

  end
end
