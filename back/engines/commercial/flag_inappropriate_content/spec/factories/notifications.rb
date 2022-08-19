# frozen_string_literal: true

FactoryBot.define do
  factory :inappropriate_content_flagged, parent: :notification, class: 'FlagInappropriateContent::Notifications::InappropriateContentFlagged' do
    initiating_user
    inappropriate_content_flag
  end
end
