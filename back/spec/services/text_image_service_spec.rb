require "rails_helper"

describe TextImageService do
  let(:service) { TextImageService.new }

  describe "swap_data_images" do

    it "returns exactly the same input languages" do
      imageable = build(:project)
      output = service.swap_data_images(imageable, :description_multiloc)
      expect(output.keys).to eq imageable.description_multiloc.keys
    end

    it "creates TextImage objects" do
      project = build(:project)
      field = :description_multiloc
      project.description_multiloc = {
        'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />',
        'nl-NL' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />',
        'fr-FR' => '<div>no image here</div>',
      }
      expect { service.swap_data_images(project, field) }.to change{TextImage.count}.from(0).to(2)
      expect(TextImage.first).to have_attributes(
        imageable: project,
        imageable_field: field.to_s
      )
    end

    it "does not modify the empty string" do
      input = ''
      imageable = build(:project, description_multiloc: {'en' => input})
      expect(service.swap_data_images(imageable, :description_multiloc)['en']).to eq input
    end

    it "does not modify HTML that contains no images" do
      input = <<~HTML
        <div>
          <p>Some content</p>
          <hr>
        </div>
      HTML
      imageable = build(:project, description_multiloc: {'en' => input})
      expect(service.swap_data_images(imageable, :description_multiloc)['en']).to eq input
    end

    it "does not modify invalid HTML" do
      input = <<~HTML
        <dif>
          <p>Some content
          <hr>
        </div>
      HTML
      imageable = build(:project, description_multiloc: {'en' => input})
      expect(service.swap_data_images(imageable, :description_multiloc)['en']).to eq input
    end

    it "replaces the src attribute of an img tag by a new text reference" do
      input = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      multiloc = service.swap_data_images(imageable, :description_multiloc)
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference).first}">
      HTML
      expect(multiloc['en']).to eq output
    end

    it "does not replace an image tag of an image that has already been processed" do
      input = <<~HTML
        <img data-cl2-text-image-text-reference="some-reference">
      HTML
      output = <<~HTML
        <img data-cl2-text-image-text-reference="some-reference">
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      res1 = service.swap_data_images imageable, :description_multiloc
      expect(res1['en']).to eq output
      imageable.update! description_multiloc: res1
      res2 = service.swap_data_images imageable, :description_multiloc
      expect(res2['en']).to eq output
    end

    it "replaces a base64 PNG data src on an img" do
      input = <<~HTML
        <img src="data:image/png;base64,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" />
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      multiloc = service.swap_data_images(imageable, :description_multiloc)
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference).first}">
      HTML
      expect(multiloc['en']).to eq output
    end

    it "replaces a base64 GIF data src on an img with a URL" do
      input = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      multiloc = service.swap_data_images(imageable, :description_multiloc)
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference).first}">
      HTML
      expect(multiloc['en']).to eq output
    end

    it "replaces a base64 JPEG data src on an img with a URL" do
      input = <<~HTML
        <img src="data:image/jpeg;base64,/9j/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=" />
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      multiloc = service.swap_data_images(imageable, :description_multiloc)
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference).first}">
      HTML
      expect(multiloc['en']).to eq output
    end

    it "replaces multiple img tags in one text" do
      input = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      multiloc = service.swap_data_images(imageable, :description_multiloc)
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference)[1]}">
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference).first}">
      HTML
      expect(multiloc['en']).to eq output
    end

    it "retains all other attributes on the img tag" do
      input = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-something="1" class="right" target="_blank">
      HTML
      imageable = create(:project, description_multiloc: {'en' => input})
      multiloc = service.swap_data_images(imageable, :description_multiloc)
      output = <<~HTML
        <img class="right" target="_blank" data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).pluck(:text_reference).first}">
      HTML
      expect(multiloc['en']).to eq output
    end

    it "removes the src attribute of an img that that already has the text reference attribute" do
      imageable = create(:project)
      text_image = create(:text_image, imageable: imageable, imageable_field: 'description_multiloc', image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
      input = <<~HTML
        <img src="#{text_image.image.url}" data-cl2-text-image-text-reference="#{text_image.text_reference}">
      HTML
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{text_image.text_reference}">
      HTML
      imageable.update!(description_multiloc: {'en' => input})
      expect(service.swap_data_images(imageable, :description_multiloc)['en']).to eq output
    end

  end

  describe 'render_data_images' do

    it 'adds a src attribute to an img tag' do
      imageable = create(:project)
      text = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
      HTML
      imageable.update!(description_multiloc: {'en' => text})
      imageable.update!(description_multiloc: service.swap_data_images(imageable, :description_multiloc))
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{imageable.reload.text_images.order(created_at: :desc).first&.text_reference}" src="#{imageable.reload.text_images.order(created_at: :desc).first&.image&.url}">
      HTML
      expect(service.render_data_images(imageable, :description_multiloc)['en']).to eq output
    end

    it 'gets all text images in one query' do
      imageable = create(:project)
      text = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
        <img src="data:image/jpeg;base64,/9j/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=">
      HTML
      imageable.update!(description_multiloc: {'en' => text, 'nl-BE' => text})
      imageable.update!(description_multiloc: service.swap_data_images(imageable, :description_multiloc))
      # In one query + 4 times:
      # SELECT "public"."tenants".* FROM "public"."tenants" WHERE "public"."tenants"."host" = $1 LIMIT $2; ["example.org", 1]
      expect{service.render_data_images(imageable, :description_multiloc)['en']}.not_to exceed_query_limit(5)
    end
  end

end
