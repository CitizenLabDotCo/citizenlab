class WebApi::V1::Fast::External::UserSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :first_name, :last_name, :slug

  attribute :avatar do |object|
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end
