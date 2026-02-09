# == Schema Information
#
# Table name: wise_voice_flags
#
#  id             :uuid             not null, primary key
#  flaggable_type :string           not null
#  flaggable_id   :uuid             not null
#  role_multiloc  :jsonb            not null
#  quotes         :jsonb            not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_wise_voice_flags_on_flaggable  (flaggable_type,flaggable_id)
#

# A WiseVoiceFlag represents a flag raised on a piece of content (idea or
# comment) that indicates that the content is written by someone with a special
# expertise or experience relevant to the topic being discussed.
class WiseVoiceFlag < ApplicationRecord
  belongs_to :flaggable, polymorphic: true

  validates :role_multiloc, presence: true, multiloc: { presence: true }
end
