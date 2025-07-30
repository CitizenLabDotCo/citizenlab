# frozen_string_literal: true

FactoryBot.define do
  factory :file_attachment, class: 'Files::FileAttachment' do
    file
    attachable factory: :project
  end
end
