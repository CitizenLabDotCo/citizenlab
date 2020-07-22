require "rails_helper"

describe SanitizationService do
  let(:service) { SanitizationService.new }

  describe "sanitize" do

    it "always allows paragraphs and breaks to pass through" do
      input = <<~HTML
        <p>paragraph<br>with<br>breaks</p>
      HTML
      features = []
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows titles to pass through when title feature is enabled" do
      input = <<~HTML
        <h2>title</h2>
        <h3>subtitle</h3>
      HTML
      features = [:title]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows alignment to pass through when alignment feature is enabled" do
      input = <<~HTML
        <p>left align</p>
        <p class="ql-align-center">center align</p>
        <p class="ql-align-right">right align</p>
      HTML
      features = [:alignment]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows lists to pass through when list feature is enabled" do
      input = <<~HTML
        <ol>
          <li>numered</li>
          <li>list</li>
        </ol>
        <p><br></p>
        <ul>
          <li>Bullet</li>
          <li>List</li>
        </ul>
      HTML
      features = [:list]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows decoration to pass through when decoration feature is enabled" do
      input = <<~HTML
        <p>
          <strong>bold text</strong>
        </p>
        <p>
          <em>cursive text</em>
        </p>
      HTML
      features = [:decoration]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows links to pass through when link feature is enabled" do
      input = <<~HTML
        <a href="https://www.google.com" target="_blank">Link</a>
      HTML
      features = [:link]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows images to pass through when title feature is enabled" do
      input = <<~HTML
        <p>
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="display: block;margin:auto;" width="313" height="160.33516960470087" data-align="center">
        </p>
      HTML
      features = [:image]
      expect(service.sanitize(input, features)).to eq input
    end

    it "disallows images to pass through when image feature is disabled" do
      input = <<~HTML
        <p>
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="display: block;margin:auto;" width="313" height="160.33516960470087" data-align="center">
        </p>
      HTML
      features = []
      expect(service.sanitize(input, features)).to eq "<p>\n  \n</p>\n"
    end

    it "allows youtube video to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Y1mtif1B8k0?showinfo=0" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it "disallows unknown url iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.badTube.com/Y1mtif1B8k0" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq "\"\"\n"
    end

    it "disallows malicious urls iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.badTube.com/https://www.youtube.com/embed/Y1mtif1B8k0" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq "\"\"\n"
    end

    it "disallows malicious urls iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//wwwXyoutube.com/embed/IqajIYxbPOI" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq "\"\"\n"
    end

    it "allows vimeo iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://player.vimeo.com/video/76979871" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows vimeo iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://vimeo.com/76979871" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows wistia iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//fast.wistia.net/embed/iframe/avk9twrrbn" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it "allows dailymotion iframe to pass through when video feature is enabled" do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.dailymotion.com/embed/video/x7724ry" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it "sanitizes invalid elements within invalid elements" do
      input = <<~HTML
        <p>Test</p><script> Hello! <script>This should be removed!</script></script> Bye!
      HTML
      features = []
      expect(service.sanitize(input, features)).to eq "<p>Test</p> Hello! This should be removed! Bye!\n"
    end

  end

  describe "remove_empty_paragraphs" do
    it "doesn't modify invalid html" do
      input = "<p Not</p>really <h1>valid</div>"
      output = service.remove_empty_paragraphs(input)
      expect(output).to eq input
    end

    it "deletes empty <p/> tag at the end" do
      html = "<h1>Nice</h1><p></p>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq "<h1>Nice</h1>"
    end

    it "deletes <p/> tag that only contain line breaks at the end" do
      html = "<h1>Nice</h1><p><br></p>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq "<h1>Nice</h1>"
    end

    it "deletes empty <p/> tags at the end" do
      html = "<h1>Nice</h1><p></p><p></p>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq "<h1>Nice</h1>"
    end

    it "deletes empty <p/> tags that only contain line breaks at the end" do
      html = "<h1>Nice</h1><p><br></p><p></p>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq "<h1>Nice</h1>"
    end

    it "doesn't delete empty <p/> tags in between" do
      html = "<p>Great</p><p></p><p>Really</p>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq html
    end

    it "doesn't delete empty <p/> tags at the start" do
      html = "<p></p><h1>Nice</h1>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq html
    end

    it "doesn't delete non-empty <p/> tags at the end" do
      html = "<h1>Nice</h1><p>Well<br>done</p>"
      output = service.remove_empty_paragraphs(html)
      expect(output).to eq html
    end
  end

  describe "linkify" do
    it "transforms a plan-text link to an anchor" do
      html = "<p>https://www.google.com</p>"
      output = service.linkify(html)
      expect(output).to eq '<p><a href="https://www.google.com" target="_blank">https://www.google.com</a></p>'
    end

    it "transforms plain-text links with one domain segment" do
      html = "<p>http://localhost:3000/ideas</p>"
      output = service.linkify(html)
      expect(output).to eq '<p><a href="http://localhost:3000/ideas" target="_blank">http://localhost:3000/ideas</a></p>'
    end

    it "doesn't transforms an existing anchor" do
      html = '<p><a href="https://www.google.com" target="_blank">https://www.google.com</a></p>'
      output = service.linkify(html)
      expect(output).to eq html
    end

    it "transforms an email to a mailto: anchor" do
      html = "<p>hello@citizenlab.co</p>"
      output = service.linkify(html)
      expect(output).to eq '<p><a href="mailto:hello@citizenlab.co" target="_blank">hello@citizenlab.co</a></p>'
    end
  end

end
