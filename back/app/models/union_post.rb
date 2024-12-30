# frozen_string_literal: true

# == Schema Information
#
# Table name: union_posts
#
#  id                       :uuid             primary key
#  title_multiloc           :jsonb
#  body_multiloc            :jsonb
#  publication_status       :string
#  published_at             :datetime
#  author_id                :uuid
#  created_at               :datetime
#  updated_at               :datetime
#  likes_count              :integer
#  location_point           :geography        point, 4326
#  location_description     :string
#  comments_count           :integer
#  slug                     :string
#  official_feedbacks_count :integer
#
class UnionPost < ApplicationRecord # TODO: DELETE!
  self.primary_key = 'id'

  has_many :comments

  # this isn't strictly necessary, but it will prevent
  # rails from calling save, which would fail anyway.
  def readonly?
    true
  end
end
