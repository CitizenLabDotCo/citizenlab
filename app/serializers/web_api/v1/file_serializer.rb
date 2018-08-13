class WebApi::V1::FileSerializer < ActiveModel::Serializer
  attributes :id, :file, :ordering, :name, :size, :created_at, :updated_at

  def size
    object.file.file.size
  end
end
