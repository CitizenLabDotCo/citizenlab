# frozen_string_literal: true

FactoryBot.define do
  factory :files_project, class: 'Files::FilesProject' do
    file factory: :global_file
    project
  end
end
