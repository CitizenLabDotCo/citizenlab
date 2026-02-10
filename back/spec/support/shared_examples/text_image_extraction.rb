# frozen_string_literal: true

# Shared examples for testing text image extraction via the Imageable concern.
# Usage in acceptance tests:
#
#   # For POST
#   context 'when body contains images' do
#     let(:body_multiloc) { { 'en' => html_with_base64_image } }
#
#     it_behaves_like 'handles record with text images',
#       model_class: Idea,
#       field: :body_multiloc,
#       expected_status: :created,
#       locale: :en
#   end
#
# @param model_class [Class]
# @param field [Symbol] The field that contains one base64 encoded image.
# @param expected_status [Symbol, Integer] The expected status of the request.
# @param locale [String] If the field is a multiloc and has multiple locales, the locale
#   to test (the locale that contains the base64 image).
RSpec.shared_examples 'handles record with text images' do |model_class:, field:, expected_status:, locale: nil|
  action = expected_status == :created ? 'Create' : 'Handle'

  example "#{action} record with images in field", document: false do
    expect { do_request }.to change(TextImage, :count).by(1)

    assert_status expected_status

    record = model_class.find(json_response_body.dig(:data, :id))

    text_image = TextImage.find_sole_by(
      imageable: record,
      imageable_type: model_class.name,
      imageable_field: field.to_s
    )

    expect(text_image.imageable).to eq(record)
    expect(text_image.imageable_field).to eq(field.to_s)

    # Content can be a String or a multiloc (Hash)
    field_content = record.public_send(field)
    if field_content.is_a?(Hash)
      field_content = locale ? field_content[locale.to_s] : field_content.values.sole
    end

    expect(field_content).not_to include('data:image/png;base64')
    expect(field_content).to include(%(data-cl2-text-image-text-reference="#{text_image.text_reference}"))
    expect(field_content).not_to include(' src="')

    response_field = response_data.dig(:attributes, field)
    if response_field.is_a?(Hash)
      response_field = locale ? response_field[locale.to_sym] : response_field.values.sole
    end

    expect(response_field).not_to include('data:image/png;base64')
    expect(response_field).to include(%(data-cl2-text-image-text-reference="#{text_image.text_reference}"))
    expect(response_field).to include(' src="')
  end
end

# Convenience aliases
RSpec.shared_examples 'creates record with text images' do |model_class:, field:, locale: nil|
  it_behaves_like 'handles record with text images', model_class:, field:, locale:, expected_status: :created
end

RSpec.shared_examples 'updates record with text images' do |model_class:, field:, locale: nil|
  it_behaves_like('handles record with text images', model_class:, field:, locale:, expected_status: :ok)
end
