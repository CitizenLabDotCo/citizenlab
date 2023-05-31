# frozen_string_literal: true

# == Schema Information
#
# Table name: internal_comments
#
#  id                 :uuid             not null, primary key
#  author_id          :uuid
#  post_type          :string
#  post_id            :uuid
#  parent_id          :uuid
#  lft                :integer          not null
#  rgt                :integer          not null
#  body_multiloc      :jsonb
#  publication_status :string           default("published"), not null
#  body_updated_at    :datetime
#  children_count     :integer          default(0), not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_internal_comments_on_author_id   (author_id)
#  index_internal_comments_on_created_at  (created_at)
#  index_internal_comments_on_lft         (lft)
#  index_internal_comments_on_parent_id   (parent_id)
#  index_internal_comments_on_post        (post_type,post_id)
#  index_internal_comments_on_post_id     (post_id)
#  index_internal_comments_on_rgt         (rgt)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
class InternalComment < ApplicationRecord
end
