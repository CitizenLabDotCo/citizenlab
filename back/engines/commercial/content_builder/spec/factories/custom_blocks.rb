# frozen_string_literal: true

FactoryBot.define do
  factory :custom_block, class: 'ContentBuilder::CustomBlock' do
    title_multiloc { { 'en' => 'My custom block' } }

    # A block needs a version before it can be published, so the version is created
    # first and the block flipped afterwards.
    trait :published do
      after(:create) do |custom_block, _evaluator|
        create(:custom_block_version, custom_block: custom_block)
        custom_block.update!(status: 'published')
      end
    end
  end

  factory :custom_block_version, class: 'ContentBuilder::CustomBlockVersion' do
    association :custom_block

    source { "export default function MyCustomBlock() {\n  return <div>Hello</div>;\n}\n" }
    bundle { 'export default function MyCustomBlock(){return null}' }
    sdk_version { 'v1' }
    manifest do
      {
        'manifest_version' => 1,
        'sdk_version' => 'v1',
        'targets' => ['report'],
        'data_uses' => ['useReportingData'],
        'queries' => ['SELECT count(*) AS contributions FROM reporting_contributions'],
        'config_schema' => { 'type' => 'object', 'properties' => {} }
      }
    end
    messages { { 'en' => {} } }
    toolchain { { 'esbuild' => '0.28.2', 'typescript' => '5.7.3', 'sdk' => 'v1' } }
  end
end
