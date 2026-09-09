# frozen_string_literal: true

FactoryBot.define do
  factory :custom_block, class: 'ContentBuilder::CustomBlock' do
    title_multiloc { { 'en' => 'My custom block' } }

    # A block can only be published once it has a current version, so the block is created
    # first and flipped to published together with its version.
    trait :published do
      after(:create) do |custom_block, _evaluator|
        version = create(:custom_block_version, custom_block: custom_block)
        custom_block.update!(current_version: version, status: 'published')
      end
    end
  end

  factory :custom_block_version, class: 'ContentBuilder::CustomBlockVersion' do
    association :custom_block

    source { "export default function MyCustomBlock() {\n  return <div>Hello</div>;\n}\n" }
    bundle { 'export default function MyCustomBlock(){return null}' }
    manifest do
      {
        'manifest_version' => 1,
        'sdk_version' => 1,
        'targets' => ['homepage'],
        'data_uses' => [],
        'config_schema' => []
      }
    end
    messages { {} }
  end

  factory :custom_block_ai_session, class: 'ContentBuilder::CustomBlockAISession' do
    association :custom_block

    status { 'active' }
    transcript { [] }
  end
end
