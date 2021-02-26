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
      expect(service.sanitize(input, features)).to eq "<p>Test</p> Hello! &lt;script&gt;This should be removed! Bye!\n"
    end

    it "sanitizes malicious javascript" do
      input = <<~HTML
        <p>
          test 
        <SCRIPT SRC=%(jscript)s?<B>
        <BODY onload!#$%%&()*~+-_.,:;?@[/|\]^`=javascript:alert(1)>
        <SCRIPT/SRC="%(jscript)s"></SCRIPT>
        <iframe src="javascript:javascript:alert('ThisPlatformWasHacked!');"></iframe>
        </p>
      HTML
      features = %i{title alignment list decoration link video}
      expect(service.sanitize(input, features)).not_to include "<iframe src=\"javascript:javascript:alert('ThisPlatformWasHacked!');\"></iframe>"
    end
  end

  describe 'remove_empty_trailing_tags' do
    it 'only removes one of the tags div, p, h2, h3, ol and ul' do
      expect(service.class::EDITOR_STRUCTURE_TAGS).to match_array %w[div p h2 h3 ol ul]
    end

    it 'doesn\'t modify invalid html' do
      input = '<p Not</p>really <h1>valid</div>'
      output = service.remove_empty_trailing_tags(input)
      expect(output).to eq input
    end

    it 'deletes empty structure tag at the end' do
      html = '<h1>Nice</h1><p></p>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<h1>Nice</h1>'
    end

    it 'deletes structure tag that only contain line breaks at the end' do
      html = '<h1>Nice</h1><h2><br></h2>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<h1>Nice</h1>'
    end

    it 'deletes empty structure tags at the end' do
      html = '<h1>Nice</h1><p></p><ol></ol>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<h1>Nice</h1>'
    end

    it 'deletes empty structure tags that only contain line breaks at the end' do
      html = '<h1>Nice</h1><p><br></p><h3></h3>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<h1>Nice</h1>'
    end

    it 'doesn\'t delete empty structure tags in between' do
      html = '<p>Great</p><p></p><p>Really</p>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete empty structure tags at the start' do
      html = '<p></p><h1>Nice</h1>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete non-empty structure tags at the end' do
      html = '<h1>Nice</h1><p>Well<br>done</p>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'deletes zero width spaces from the html' do
      html = '<p>Nice&#65279;</p>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<p>Nice</p>'
    end

    it 'replaces non-breaking spaces in the html' do
      html = '<p>Nice&nbsp;</p>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<p>Nice </p>'
    end

    it 'deletes empty spaces in nested empty tags if they\'re last' do
      html = '<p>Nice</p><p><br></p><p>Well done</p><p><br></p><h3><strong>&#65279;</strong></h3>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<p>Nice</p><p><br></p><p>Well done</p>'
    end

    it "doesn't delete empty nested tags with trailing content" do
      html = '<p>Nice</p><p><br></p><p>Well done</p><p><br></p><h3><strong>&#65279;</strong></h3><p>Well done</p>'
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq '<p>Nice</p><p><br></p><p>Well done</p><p><br></p><h3><strong></strong></h3><p>Well done</p>'
    end

    it 'doesn\'t delete images in the last line of content' do
      html = <<~HTML
        <p>
          Testing
        </p>
        <p>
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP">
        </p>
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete trailing images' do
      html = <<~HTML
        <p>
          Testing
        </p>
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP">
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete trailing images with complex base64 strings' do
      html = <<~HTML
        <p>qweqweqweqwe</p>
        <p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUgAAACRCAYAAAChUiFgAAABQmlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSCwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAw8DOIMjAySCXmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsgsbcHrjJlvIy94HY3bt6yRLQpTPQrgSkktTgbSf4A4JbmgqISBgTEByFYuLykAsVuAbJEioKOA7BkgdjqEvQbEToKwD4DVhAQ5A9lXgGyB5IzEFCD7CZCtk4Qkno7EhtoLdkOAh4+CkYlxmDkBx5IKSlIrSkC0c35BZVFmekaJgiMwhFIVPPOS9XQUjAyMDBgYQOENUf35BjgcGcU4EGIpTxkYjHOBghoIsSwBBobd3xgYBLcixNQfAr00l4HhQEBBYlEi3AGM31iK04yNIGzu7QwMrNP+//8czsDArsnA8Pf6//+/t////3cZAwPzLaDebwCKpl7ZLwfKCwAAAFZlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA5KGAAcAAAASAAAARKACAAQAAAABAAABSKADAAQAAAABAAAAkQAAAABBU0NJSQAAAFNjcmVlbnNob3RTua7jAAAB1mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4zMjg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTQ1PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cgbzcd8AAAR2SURBVHgB7dSxDcAwDAQxx7so+2+YAG6N24AqvySEe96ZbzkCBAgQuAT2tRgIECBA4AgIpEcgQIBACAhkwJgJECAgkH6AAAECISCQAWMmQICAQPoBAgQIhIBABoyZAAECAukHCBAgEAICGTBmAgQICKQfIECAQAgIZMCYCRAgIJB+gAABAiEgkAFjJkCAgED6AQIECISAQAaMmQABAgLpBwgQIBACAhkwZgIECAikHyBAgEAICGTAmAkQICCQfoAAAQIhIJABYyZAgIBA+gECBAiEgEAGjJkAAQIC6QcIECAQAgIZMGYCBAgIpB8gQIBACAhkwJgJECAgkH6AAAECISCQAWMmQICAQPoBAgQIhIBABoyZAAECAukHCBAgEAICGTBmAgQICKQfIECAQAgIZMCYCRAgIJB+gAABAiEgkAFjJkCAgED6AQIECISAQAaMmQABAgLpBwgQIBACAhkwZgIECAikHyBAgEAICGTAmAkQICCQfoAAAQIhIJABYyZAgIBA+gECBAiEgEAGjJkAAQIC6QcIECAQAgIZMGYCBAgIpB8gQIBACAhkwJgJECAgkH6AAAECISCQAWMmQICAQPoBAgQIhIBABoyZAAECAukHCBAgEAICGTBmAgQICKQfIECAQAgIZMCYCRAgIJB+gAABAiEgkAFjJkCAgED6AQIECISAQAaMmQABAgLpBwgQIBACAhkwZgIECAikHyBAgEAICGTAmAkQICCQfoAAAQIhIJABYyZAgIBA+gECBAiEgEAGjJkAAQIC6QcIECAQAgIZMGYCBAgIpB8gQIBACAhkwJgJECAgkH6AAAECISCQAWMmQICAQPoBAgQIhIBABoyZAAECAukHCBAgEAICGTBmAgQICKQfIECAQAgIZMCYCRAgIJB+gAABAiEgkAFjJkCAgED6AQIECISAQAaMmQABAgLpBwgQIBACAhkwZgIECAikHyBAgEAICGTAmAkQICCQfoAAAQIhIJABYyZAgIBA+gECBAiEgEAGjJkAAQIC6QcIECAQAgIZMGYCBAgIpB8gQIBACAhkwJgJECAgkH6AAAECISCQAWMmQICAQPoBAgQIhIBABoyZAAECAukHCBAgEAICGTBmAgQICKQfIECAQAgIZMCYCRAgIJB+gAABAiEgkAFjJkCAgED6AQIECISAQAaMmQABAgLpBwgQIBACAhkwZgIECAikHyBAgEAICGTAmAkQICCQfoAAAQIhIJABYyZAgIBA+gECBAiEgEAGjJkAAQIC6QcIECAQAgIZMGYCBAgIpB8gQIBACAhkwJgJECAgkH6AAAECISCQAWMmQICAQPoBAgQIhIBABoyZAAECAukHCBAgEAICGTBmAgQICKQfIECAQAgIZMCYCRAgIJB+gAABAiEgkAFjJkCAgED6AQIECISAQAaMmQABAgLpBwgQIBACAhkwZgIECAikHyBAgEAICGTAmAkQICCQfoAAAQIhIJABYyZAgIBA+gECBAiEgEAGjJkAAQIC6QcIECAQAj+cJAKROCvwtAAAAABJRU5ErkJggg=="></p>
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete trailing iframes wrapped in p' do
      html = <<~HTML
        <p>qweqweqweqwe</p>
        "
        <p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//wwwXyoutube.com/embed/IqajIYxbPOI" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe></p>
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete trailing iframes' do
      html = <<~HTML
        <p>qweqweqweqwe</p>
        "
        <iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//wwwXyoutube.com/embed/IqajIYxbPOI" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display: block;margin:auto;cursor: nwse-resize;" data-align="center"></iframe>
      HTML
      output = service.remove_empty_trailing_tags(html)
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
