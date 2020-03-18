module Volunteering
  class Cause < ApplicationRecord
    mount_base64_uploader :image, CauseImageUploader
    acts_as_list column: :ordering, top_of_list: 0, add_new_at: :bottom, scope: [:participation_context_type, :participation_context_id]

    belongs_to :participation_context, polymorphic: true
    has_many :volunteers, class_name: 'Volunteering::Volunteer', dependent: :destroy

    validates :title_multiloc, presence: true, multiloc: {presence: true}
    validates :description_multiloc, multiloc: {presence: false}
  end
end
