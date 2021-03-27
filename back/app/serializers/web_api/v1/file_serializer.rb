class WebApi::V1::FileSerializer < WebApi::V1::BaseSerializer
  attributes :file, :ordering, :name, :size, :created_at, :updated_at

  attribute :size do |object|
    object.file.file.size
  end
end
