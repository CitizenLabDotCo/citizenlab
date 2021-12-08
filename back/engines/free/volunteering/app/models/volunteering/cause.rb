# == Schema Information
#
# Table name: volunteering_causes
#
#  id                         :uuid             not null, primary key
#  participation_context_id   :uuid             not null
#  participation_context_type :string           not null
#  title_multiloc             :jsonb            not null
#  description_multiloc       :jsonb            not null
#  volunteers_count           :integer          default(0), not null
#  image                      :string
#  ordering                   :integer          not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_volunteering_causes_on_ordering               (ordering)
#  index_volunteering_causes_on_participation_context  (participation_context_type,participation_context_id)
#
module Volunteering
  class Cause < ApplicationRecord
    mount_base64_uploader :image, CauseImageUploader
    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:participation_context_type, :participation_context_id]

    belongs_to :participation_context, polymorphic: true
    has_many :volunteers, class_name: 'Volunteering::Volunteer', dependent: :destroy

    validates :title_multiloc, presence: true, multiloc: {presence: true}
    validates :description_multiloc, multiloc: {presence: false}


    before_validation :sanitize_description_multiloc
    before_validation :strip_title

    private

    def sanitize_description_multiloc
      service = SanitizationService.new
      self.description_multiloc = service.sanitize_multiloc(
        self.description_multiloc,
        %i{title alignment list decoration link image video}
      )
      self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
      self.description_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_multiloc)
    end

    def strip_title
      self.title_multiloc.each do |key, value|
        self.title_multiloc[key] = value.strip
      end
    end
  end
end
