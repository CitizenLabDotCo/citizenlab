class EmailCampaigns::TopCommentSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :children_count, :created_at, :updated_at, :author_first_name, :author_last_name, :author_locale, :author_avatar
  # attributes :body_multiloc, :children_count, :created_at, :author_first_name, :author_last_name, :author_avatar

  def children_count
  	object.children.count
  end

  def author_first_name
    object.author&.first_name
  end

  def author_last_name
  	object.author&.last_name
  end

  def author_locale
  	object.author.locale
  end

  def author_avatar
    object.author.avatar && object.author.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end