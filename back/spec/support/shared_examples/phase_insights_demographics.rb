RSpec.shared_examples 'phase insights demographics' do |gender_blank:, birthyear_blank:|
  example_request 'includes expected demographics' do
    demographics = json_response_body.dig(:data, :attributes, :demographics)

    expect(demographics[:fields]).to contain_exactly({
      id: custom_field_gender.id,
      key: 'gender',
      code: nil,
      input_type: 'select',
      title_multiloc: { en: 'Gender' },
      series: { male: 1, female: 1, unspecified: 0, _blank: gender_blank },
      options: {
        male: { title_multiloc: { en: 'Male' }, ordering: 0 },
        female: { title_multiloc: { en: 'Female' }, ordering: 1 },
        unspecified: { title_multiloc: { en: 'Unspecified' }, ordering: 2 }
      },
      reference_distribution: { male: 480, unspecified: 10, female: 510 }
    }, {
      id: custom_field_birthyear.id,
      key: 'birthyear',
      code: nil,
      input_type: 'number',
      title_multiloc: { en: 'Birthyear' },
      series: { '18-24': 0, '25-34': 0, '35-44': 1, '45-54': 1, '55-64': 0, '65+': 0, _blank: birthyear_blank },
      reference_distribution: { '18-24': 50, '25-34': 200, '35-44': 400, '45-54': 300, '55-64': 50, '65+': 700 }
    })
  end
end
