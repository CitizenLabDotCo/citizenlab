require 'rails_helper'

RSpec.describe CustomFieldOption, type: :model do
  context 'hooks' do
    it 'generates unique keys in the custom field scope on creation, if not specified' do
      cf = create(:custom_field_select)
      cfo1 = create(:custom_field_option, key: nil, custom_field: cf)
      cfo2 = create(:custom_field_option, key: nil, custom_field: cf)
      cfo3 = create(:custom_field_option, key: nil, custom_field: cf)
      expect([cfo1, cfo2, cfo3].map(&:key).uniq).to match [cfo1, cfo2, cfo3].map(&:key)
    end
  end
end
