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
#       expected_status: :created
#   end
RSpec.shared_examples 'handles record with text images' do |model_class:, field:, expected_status:|
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
    field_content = field_content.values.sole if field_content.is_a?(Hash)

    expect(field_content).not_to include('data:image/png;base64')
    expect(field_content).to include(%(data-cl2-text-image-text-reference="#{text_image.text_reference}"))
    expect(field_content).not_to include(' src="')

    response_field = response_data.dig(:attributes, field)
    response_field = response_field.values.sole if response_field.is_a?(Hash)

    expect(response_field).not_to include('data:image/png;base64')
    expect(response_field).to include(%(data-cl2-text-image-text-reference="#{text_image.text_reference}"))
    expect(response_field).to include(' src="')
  end
end

# Convenience aliases
RSpec.shared_examples 'creates record with text images' do |model_class:, field:|
  it_behaves_like 'handles record with text images',
    model_class: model_class,
    field: field,
    expected_status: :created
end

RSpec.shared_examples 'updates record with text images' do |model_class:, field:|
  it_behaves_like 'handles record with text images',
    model_class: model_class,
    field: field,
    expected_status: :ok
end
