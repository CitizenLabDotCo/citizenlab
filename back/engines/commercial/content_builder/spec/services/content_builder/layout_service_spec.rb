# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutService do
  let(:service) { described_class.new }

  describe 'select_craftjs_elements_for_type' do
    it 'can deal with different combinations of hash structures' do
      content = {
        'elt1' => 'string element',
        'elt2' => { 'type' => 'div', 'props' => 'elt2-props' },
        'elt3' => { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt3-props' }
      }
      images = service.select_craftjs_elements_for_type content, 'Image'
      expect(images).to eq [{ 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt3-props' }]
    end
  end
end
