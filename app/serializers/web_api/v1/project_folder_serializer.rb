class WebApi::V1::ProjectFolderSerializer < WebApi::V1::BaseSerializer

  attributes :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :created_at, :updated_at

  attribute :projects_count do |object|
    object.admin_publication&.children_count
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  # has_many :projects do |object|
  #   object.projects.order(:ordering)
  # end

end
