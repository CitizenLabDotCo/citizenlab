# == Schema Information
#
# Table name: content_builder_layouts
#
#  id                     :uuid             not null, primary key
#  craftjs_jsonmultiloc   :jsonb
#  content_buildable_type :string           not null
#  content_buildable_id   :uuid             not null
#  code                   :string           not null
#  enabled                :boolean          default(FALSE), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_content_builder_layouts_content_buidable_type_id_code  (content_buildable_type,content_buildable_id,code) UNIQUE
#
module ContentBuilder
  class Layout < ApplicationRecord
    belongs_to :content_buildable, polymorphic: true

    validates :content_buildable, :code, presence: true
  end
end
