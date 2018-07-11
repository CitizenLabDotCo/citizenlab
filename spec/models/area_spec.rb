require 'rails_helper'

RSpec.describe Area, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:area)).to be_valid
    end
  end

  describe "description sanitizer" do

    it "sanitizes script tags in the description" do
      area = create(:area, description_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(area.description_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
    end

    it "retains all supported tags and attributes by the editor" do
      output = '<h1>Title</h1><h2>Subtitle</h2><p>left align</p><p class="ql-align-center">center align</p><p class="ql-align-right">right align</p><ol><li>numered</li><li>list</li></ol><p><br></p><ul><li>Bullet</li><li>List</li></ul><p><br></p><p><strong>bold text</strong></p><p><em>cursive text</em></p><p><a href="https://www.google.com" target="_blank">Link</a></p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="display: block;margin:auto;" width="313" height="160.33516960470087" data-align="center"></p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/dQw4w9WgXcQ?showinfo=0" data-blot-formatter-unclickable-bound="true"></iframe><p><br></p>'
      area = create(:area, description_multiloc: {"en" => output})
      expect(area.description_multiloc["en"].remove("\n")).to eq output
    end
    
  end

  describe "delete an area" do
    it "with an ideas associated to it should succeed" do
      area = create(:area)
      idea = create(:idea, areas: [area])
      expect{ area.destroy }.not_to raise_error
    end
  end
end
