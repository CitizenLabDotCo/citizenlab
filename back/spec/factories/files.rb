# frozen_string_literal: true

FactoryBot.define do
  factory :file, class: 'Files::File' do
    name { 'minimal_pdf.pdf' }
    association :uploader, factory: :user

    content do
      Rails.root.join('spec/fixtures', name).open
    rescue Errno::ENOENT
      Rails.root.join('spec/fixtures/minimal_pdf.pdf').open
    end

    trait :meeting do
      category { 'meeting' }
    end

    trait :interview do
      category { 'interview' }
    end

    trait :strategic_plan do
      category { 'strategic_plan' }
    end

    trait :info_sheet do
      category { 'info_sheet' }
    end

    trait :policy do
      category { 'policy' }
    end

    trait :report do
      category { 'report' }
    end

    trait :other do
      category { 'other' }
    end

    trait :with_description do
      description_multiloc do
        AppConfiguration.instance.settings('core', 'locales').index_with do |locale|
          "Description in #{locale}"
        end
      end
    end
  end
end
