require 'rails_helper'
require 'csv'

describe 'rake cl2_back:insert_option_key_values_in_user_custom_field_values' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['cl2_back:insert_option_key_values_in_user_custom_field_values'].reenable }

  let(:task) { Rake::Task['cl2_back:insert_option_key_values_in_user_custom_field_values'] }
  let(:csv_data) { CSV.parse(open(csv).read, headers: true, col_sep: ',', converters: []) }
  let(:custom_field) { create(:custom_field, input_type: 'select', resource_type: 'User', key: 'postcode_ex6') }
  let!(:custom_field_option1) do
    create(:custom_field_option, custom_field: custom_field, key: '1234ab_zs9', title_multiloc: { en: '1234AB' })
  end
  let!(:custom_field_option2) do
    create(:custom_field_option, custom_field: custom_field, key: '9876zy_ak7', title_multiloc: { en: '9876ZY' })
  end
  let!(:user1) do
    create(:user, id: csv_data[0]['id'], custom_field_values: { 'unrelated_key' => 'some_value' })
  end
  let!(:user2) { create(:user, id: csv_data[1]['id']) }
  let!(:user3) { create(:user, id: csv_data[2]['id']) }
  let!(:user4) { create(:user, id: csv_data[3]['id']) }
  let!(:user5) do
    create(:user, id: csv_data[4]['id'], custom_field_values: { "#{custom_field.key}": custom_field_option1.key })
  end
  let!(:user6) do
    create(:user, id: csv_data[5]['id'], custom_field_values: { "#{custom_field.key}": custom_field_option2.key })
  end

  let_it_be(:csv) { Rails.root.join('engines/commercial/multi_tenancy/spec/fixtures/user_custom_field_values.csv') }

  it 'inserts key-value pairs when sanitized given value matches an option' do
    expect(csv_data[0]['value']).to eq('1234  AB')
    expect(csv_data[1]['value']).to eq('1234ab')
    expect(csv_data[2]['value']).to eq('1234 a  B')

    task.invoke(csv, 'example.org', custom_field.id, 'execute')

    expect(User.find(csv_data[0]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option1.key)
    expect(User.find(csv_data[1]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option1.key)
    expect(User.find(csv_data[2]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option1.key)
  end

  it 'merges inserted key-value pairs into existing custom_field_values hash' do
    task.invoke(csv, 'example.org', custom_field.id, 'execute')

    expect(User.find(csv_data[0]['id']).custom_field_values['unrelated_key']).to eq('some_value')
  end

  it 'does not insert anything when sanitized given value does not match an option' do
    expect(csv_data[3]['value']).to eq('not a match')

    task.invoke(csv, 'example.org', custom_field.id, 'execute')

    expect(User.find(csv_data[3]['id']).custom_field_values[custom_field.key]).to be_nil
  end

  it 'does not overwite an existing value when the given value is nil' do
    expect(csv_data[4]['value']).to be_nil
    expect(User.find(csv_data[4]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option1.key)

    task.invoke(csv, 'example.org', custom_field.id, 'execute')

    expect(User.find(csv_data[4]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option1.key)
  end

  it 'does not overwite an existing value when the given value is valid' do
    expect(csv_data[5]['value']).to eq('1234AB')
    expect(User.find(csv_data[5]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option2.key)

    task.invoke(csv, 'example.org', custom_field.id, 'execute')

    expect(User.find(csv_data[5]['id']).custom_field_values[custom_field.key]).to eq(custom_field_option2.key)
  end

  it "does nothing if the 4th argument is not 'execute'" do
    task.invoke(csv, 'example.org', custom_field.id, 'dry_run')

    expect(User.find(csv_data[0]['id']).custom_field_values).to eq({ 'unrelated_key' => 'some_value' })
    expect(User.find(csv_data[1]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[2]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[3]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[4]['id']).custom_field_values)
      .to eq({ custom_field.key.to_s => custom_field_option1.key })
    expect(User.find(csv_data[5]['id']).custom_field_values)
      .to eq({ custom_field.key.to_s => custom_field_option2.key })
  end

  it 'does nothing if the 4th argument is not given' do
    task.invoke(csv, 'example.org', custom_field.id)

    expect(User.find(csv_data[0]['id']).custom_field_values).to eq({ 'unrelated_key' => 'some_value' })
    expect(User.find(csv_data[1]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[2]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[3]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[4]['id']).custom_field_values)
      .to eq({ custom_field.key.to_s => custom_field_option1.key })
    expect(User.find(csv_data[5]['id']).custom_field_values)
      .to eq({ custom_field.key.to_s => custom_field_option2.key })
  end

  it 'does nothing if the custom_field does not exist' do
    task.invoke(csv, 'example.org', 'not_a_custom_field_id', 'execute')

    expect(User.find(csv_data[0]['id']).custom_field_values).to eq({ 'unrelated_key' => 'some_value' })
    expect(User.find(csv_data[1]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[2]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[3]['id']).custom_field_values).to eq({})
    expect(User.find(csv_data[4]['id']).custom_field_values)
      .to eq({ custom_field.key.to_s => custom_field_option1.key })
    expect(User.find(csv_data[5]['id']).custom_field_values)
      .to eq({ custom_field.key.to_s => custom_field_option2.key })
  end
end
