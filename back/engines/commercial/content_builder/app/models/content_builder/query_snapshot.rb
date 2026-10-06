# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_query_snapshots
#
#  id          :uuid             not null, primary key
#  layout_id   :uuid             not null
#  query_hash  :string           not null
#  sql         :text             not null
#  data        :jsonb            not null
#  executed_at :datetime         not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_query_snapshots_on_layout_id_and_query_hash  (layout_id,query_hash) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (layout_id => content_builder_layouts.id) ON DELETE => cascade
#
module ContentBuilder
  # One reporting query and the answer it gave, stored against the layout that asks it.
  #
  # A report is a picture of a moment. Every query a block runs is executed once, when
  # the block is first rendered, and every later read — by the admin editing, by a
  # reader, by the PDF export — returns this stored answer. Three things follow that
  # the live path cannot give: a reader never executes SQL, the report does not change
  # under the admin while they edit it, and a check of a block is repeatable.
  #
  # "Refresh data" is the explicit admin action that replaces these.
  class QuerySnapshot < ApplicationRecord
    belongs_to :layout, class_name: 'ContentBuilder::Layout'

    validates :query_hash, presence: true, uniqueness: { scope: :layout_id }
    validates :sql, presence: true
    validates :executed_at, presence: true

    # The identity of a question, independent of how it was spelled: the sandbox's
    # normalized SQL is what gets hashed, so whitespace cannot fork a snapshot.
    def self.hash_for(normalized_sql)
      Digest::SHA256.hexdigest(normalized_sql)
    end

    def columns = data['columns'] || []
    def rows = data['rows'] || []
    def truncated? = data['truncated'].present?
  end
end
