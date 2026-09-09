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
#  current_version_id   :uuid
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
#  fk_rails_...  (current_version_id => content_builder_custom_block_versions.id) ON DELETE => nullify
#
module ContentBuilder
  # A page builder widget whose React code is authored by an AI loop. The block itself
  # only carries the presentational metadata and the publication status; the actual code
  # lives in its {CustomBlockVersion versions}, one of which is the +current_version+ that
  # gets rendered.
  class CustomBlock < ApplicationRecord
    STATUSES = %w[draft published disabled].freeze

    has_many :versions,
      class_name: 'ContentBuilder::CustomBlockVersion',
      inverse_of: :custom_block,
      dependent: :destroy
    has_many :ai_sessions,
      class_name: 'ContentBuilder::CustomBlockAISession',
      inverse_of: :custom_block,
      dependent: :destroy

    belongs_to :current_version, class_name: 'ContentBuilder::CustomBlockVersion', optional: true
    belongs_to :created_by, class_name: 'User', optional: true

    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :status, inclusion: { in: STATUSES }
    validate :validate_current_version_when_published

    def published?
      status == 'published'
    end

    private

    def validate_current_version_when_published
      return if !published? || current_version.present?

      errors.add :current_version, :blank, message: 'must be set before a custom block can be published'
    end
  end
end
