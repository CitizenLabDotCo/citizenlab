# frozen_string_literal: true

# == Schema Information
#
# Table name: volunteering_causes
#
#  id                   :uuid             not null, primary key
#  phase_id             :uuid             not null
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb            not null
#  volunteers_count     :integer          default(0), not null
#  image                :string
#  ordering             :integer          not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deleted_at           :datetime
#
# Indexes
#
#  index_volunteering_causes_on_deleted_at  (deleted_at)
#  index_volunteering_causes_on_ordering    (ordering)
#  index_volunteering_causes_on_phase_id    (phase_id)
#
module Volunteering
  class Cause < ApplicationRecord
    acts_as_paranoid
    mount_base64_uploader :image, CauseImageUploader
    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: %i[phase_id]

    belongs_to :phase
    has_many :volunteers, class_name: 'Volunteering::Volunteer', dependent: :destroy

    validates :title_multiloc, presence: true, multiloc: { presence: true }
    validates :description_multiloc, multiloc: { presence: false, html: true }

    before_validation :sanitize_description_multiloc
    before_validation :strip_title

    def project_id
      phase.try(:project_id)
    end

    private

    def sanitize_description_multiloc
      service = SanitizationService.new
      self.description_multiloc = service.sanitize_multiloc(
        description_multiloc,
        %i[title alignment list decoration link image video]
      )
      self.description_multiloc = service.linkify_multiloc description_multiloc
      self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
    end

    def strip_title
      title_multiloc.each do |key, value|
        title_multiloc[key] = value.strip
      end
    end
  end
end
