# frozen_string_literal: true

FactoryBot.define do
  factory :default_layout, class: 'ContentBuilder::Layout' do
    factory :layout, class: 'ContentBuilder::Layout' do
      transient do
        project { create(:project) }
      end
      content_buildable { project }
      code { 'layout-1' }
      enabled { true }
    end

    factory :homepage_layout, class: 'ContentBuilder::Layout' do
      code { 'homepage' }
      enabled { true }
    end

    factory :report_layout, class: 'ContentBuilder::Layout' do
      content_buildable { association(:report, layout: instance) }
      code { 'report' }
      enabled { true }
    end

    trait :with_image do
      transient do
        data_code { SecureRandom.uuid }
      end

      craftjs_json do
        {
          'ROOT' => {
            'type' => 'div',
            'nodes' => ['-02FjXHWIf'],
            'props' => { 'id' => 'e2e-content-builder-frame' },
            'custom' => {},
            'hidden' => false,
            'isCanvas' => true,
            'displayName' => 'div',
            'linkedNodes' => {}
          },
          '-02FjXHWIf' => {
            'type' => { 'resolvedName' => 'ImageMultiloc' },
            'nodes' => [],
            'props' => { 'image' => { 'dataCode' => data_code } },
            'custom' => {},
            'hidden' => false,
            'parent' => 'ROOT',
            'isCanvas' => false,
            'displayName' => 'Image',
            'linkedNodes' => {}
          }
        }
      end

      after(:create) do |_layout, evaluator|
        create(:layout_image, code: evaluator.data_code)
      end
    end
  end
end
