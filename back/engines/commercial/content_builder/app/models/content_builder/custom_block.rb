# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_custom_blocks
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb
#  status               :string           default("draft"), not null
#  created_by_id        :uuid
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_content_builder_custom_blocks_on_created_by_id  (created_by_id)
#  index_content_builder_custom_blocks_on_status         (status)
#
# Foreign Keys
#
#  fk_rails_...  (created_by_id => users.id) ON DELETE => nullify
#
module ContentBuilder
  # A page builder widget whose React code is authored by an AI loop. The block itself
  # only carries the presentational metadata and the publication status; the code lives
  # in its {CustomBlockVersion versions}, which are immutable.
  #
  # There is deliberately no "current version" pointer. A layout places a block by
  # pinning +{blockId, version}+ in the craftjs node props, so regenerating a block
  # never changes a report that is already written. The pin is the only thing that
  # decides which version renders.
  class CustomBlock < ApplicationRecord
    STATUSES = %w[draft published disabled].freeze

    # delete_all, not destroy: a version is an inert row with nothing to tear down,
    # and it refuses to be destroyed on its own so that a layout's pin cannot be
    # pulled out from under it. This matches the ON DELETE CASCADE on the column.
    has_many :versions,
      class_name: 'ContentBuilder::CustomBlockVersion',
      inverse_of: :custom_block,
      dependent: :delete_all
    belongs_to :created_by, class_name: 'User', optional: true

    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :status, inclusion: { in: STATUSES }
    validate :validate_version_exists_when_published

    def published?
      status == 'published'
    end

    # The newest version. Only used to offer a starting point when authoring; never
    # to decide what renders.
    def latest_version
      versions.order(number: :desc).first
    end

    private

    def validate_version_exists_when_published
      return if !published? || versions.any?

      errors.add :base, :no_version, message: 'a custom block needs a version before it can be published'
    end
  end
end
