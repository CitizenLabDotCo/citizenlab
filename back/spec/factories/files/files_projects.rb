# frozen_string_literal: true

FactoryBot.define do
  factory :files_project, class: 'Files::FilesProject' do
    file
    project
  end
end
