# frozen_string_literal: true

require 'rails_helper'

describe RandomCustomFieldValuesService do
  subject(:service) { described_class.new }

  it 'answers every required field with a type-appropriate value' do
    select = create(:custom_field_select, :with_options, required: true)
    checkbox = create(:custom_field_checkbox, required: true)
    number = create(:custom_field_number, required: true, maximum: 10)

    values = service.generate([select, checkbox, number])

    expect(select.options.map(&:key)).to include(values[select.key])
    expect(values[checkbox.key]).to be_in([true, false])
    expect(values[number.key]).to be_between(1, 10)
  end

  it 'generates a birthyear for ages 18-80' do
    birthyear = create(:custom_field_birthyear, required: true)

    value = service.generate([birthyear])[birthyear.key]

    expect(value).to be_between(Time.zone.now.year - 80, Time.zone.now.year - 18)
  end

  it 'generates a domicile from the platform areas' do
    domicile = create(:custom_field_domicile, required: true)
    area = create(:area)

    value = service.generate([domicile])[domicile.key]

    expect(value).to be_in([area.id, 'outside'])
  end

  it 'skips pages and unsupported types' do
    page = create(:custom_field_page)
    file_upload = create(:custom_field_file_upload, required: true)

    expect(service.generate([page, file_upload])).to eq({})
  end
end
