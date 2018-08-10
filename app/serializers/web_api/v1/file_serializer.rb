class WebApi::V1::FileSerializer < ActiveModel::Serializer
  attributes :id, :file, :ordering, :file_name, :file_size, :created_at, :updated_at

  def file_name
    object.file.file.filename
  end

  def file_size
    object.file.file.size
  end
end
