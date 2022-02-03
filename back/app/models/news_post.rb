# == Schema Information
#
# Table name: news_posts
#
#  id             :uuid             not null, primary key
#  title_multiloc :jsonb
#  body_multiloc  :jsonb
#  slug           :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class NewsPost < ApplicationRecord
end
