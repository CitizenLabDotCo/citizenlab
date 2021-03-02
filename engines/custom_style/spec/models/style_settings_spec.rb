require 'rails_helper'

RSpec.shared_examples_for 'StyleSettings' do

  let (:model) { described_class }

  it "validates style using a valid json schema" do
    metaschema = JSON::Validator.validator_for_name("draft4").metaschema
    schema = AppConfiguration.style_json_schema
    expect(JSON::Validator.validate!(metaschema, schema)).to be true
  end

  it "does not validate out-of-schema style properties" do
    instance = build(model.to_s.underscore.to_sym, style: {thisIsNotAStyleProp: true})
    expect(instance).to be_invalid
  end

end
