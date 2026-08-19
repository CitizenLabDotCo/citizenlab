# frozen_string_literal: true

require 'rails_helper'

describe SanitizationService do
  let(:service) { described_class.new }

  describe 'sanitize' do
    it 'always allows paragraphs and breaks to pass through' do
      input = <<~HTML
        <p>paragraph<br>with<br>breaks</p>
      HTML
      features = []
      expect(service.sanitize(input, features)).to eq input
    end

    it 'does not mutate the passed features array and accepts a frozen one' do
      features = %i[link image].freeze
      expect { service.sanitize('<a href="https://example.com">x</a>', features) }.not_to raise_error
      expect(features).to eq %i[link image]
    end

    it 'allows titles to pass through when title feature is enabled' do
      input = <<~HTML
        <h2>title</h2>
        <h3>subtitle</h3>
      HTML
      features = [:title]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows alignment to pass through when alignment feature is enabled' do
      input = <<~HTML
        <p>left align</p>
        <p class="ql-align-center">center align</p>
        <p class="ql-align-right">right align</p>
      HTML
      features = [:alignment]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows lists to pass through when list feature is enabled' do
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

    it 'keeps the start attribute on ordered lists when list feature is enabled' do
      # The frontend adds `start` to an ordered list that resumes after a bullet
      # interruption so its numbering stays continuous, matching the editor.
      input = '<ol start="2"><li>two</li><li>three</li></ol>'
      features = [:list]
      expect(service.sanitize(input, features)).to include('start="2"')
    end

    it 'allows decoration to pass through when decoration feature is enabled' do
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

    it 'allows links to pass through when link feature is enabled' do
      input = <<~HTML
        <a href="https://www.google.com" target="_blank" rel="noreferrer noopener nofollow">Link</a>
      HTML
      features = [:link]
      expect(service.sanitize(input, features)).to eq input
    end

    pending 'fixes links blank target and referrer allowed' do
      input = <<~HTML
        <a href="https://www.google.com" target="_blank">Link</a>
      HTML
      parsed_input = <<~HTML
        <a href="https://www.google.com" target="_blank" rel="noreferrer noopener nofollow">Link</a>
      HTML
      features = [:link]
      expect(service.sanitize(input, features)).to eq parsed_input
    end

    it 'adds nofollow to links without rel' do
      input = <<~HTML
        <a href="https://www.google.com">Link</a>
      HTML
      parsed_input = <<~HTML
        <a href="https://www.google.com" rel="nofollow">Link</a>
      HTML
      features = [:link]
      expect(service.sanitize(input, features)).to eq parsed_input
    end

    it 'adds nofollow to links with rel but without nofollow' do
      input = <<~HTML
        <a href="https://www.google.com" rel="noopen whatever">Link</a>
      HTML
      parsed_input = <<~HTML
        <a href="https://www.google.com" rel="noopen whatever nofollow">Link</a>
      HTML
      features = [:link]
      expect(service.sanitize(input, features)).to eq parsed_input
    end

    it 'allows images to pass through when title feature is enabled' do
      input = <<~HTML
        <p>
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="display:block;margin:auto;" width="313" height="160.33516960470087" data-align="center">
        </p>
      HTML
      features = [:image]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows image alt and title attributes to pass through when image feature is enabled' do
      input = <<~HTML
        <p>
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="A description" title="Image title" width="313" height="160">
        </p>
      HTML
      features = [:image]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'disallows images to pass through when image feature is disabled' do
      input = <<~HTML
        <p>
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="display:block;margin:auto;" width="313" height="160.33516960470087" data-align="center">
        </p>
      HTML
      features = []
      expect(service.sanitize(input, features)).to eq "<p>\n  \n</p>\n"
    end

    it 'allows youtube video to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Y1mtif1B8k0?showinfo=0" referrerpolicy="strict-origin-when-cross-origin" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'disallows unknown url iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.badTube.com/Y1mtif1B8k0" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq "\"\"\n"
    end

    it 'disallows malicious urls iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.badTube.com/https://www.youtube.com/embed/Y1mtif1B8k0" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq "\"\"\n"
    end

    it 'disallows malicious urls iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//wwwXyoutube.com/embed/IqajIYxbPOI" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq "\"\"\n"
    end

    it 'allows vimeo iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://player.vimeo.com/video/76979871" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows wistia iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://support.wistia.com/medias/26sk4lmiix" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows dailymotion iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.dailymotion.com/embed/video/x7724ry" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows videotool.dk iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://media.videotool.dk/?vn=441_2021012709502264679179376222" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'allows dreambroker iframe to pass through when video feature is enabled' do
      input = <<~HTML
        "<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.dreambroker.com/channel/3lkvmi5h/iframe/33jxadml" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>"
      HTML
      features = [:video]
      expect(service.sanitize(input, features)).to eq input
    end

    it 'sanitizes invalid elements within invalid elements' do
      input = <<~HTML
        <p>Test</p><script> Hello! <script>This should be removed!</script></script> Bye!
      HTML
      features = []
      expect(service.sanitize(input, features)).to eq "<p>Test</p> Hello! &lt;script&gt;This should be removed! Bye!\n"
    end

    it 'sanitizes malicious javascript' do
      input = <<~HTML
        <p>
          test
        <SCRIPT SRC=%(jscript)s?<B>
        <BODY onload!#$%%&()*~+-_.,:;?@[/|]^`=javascript:alert(1)>
        <SCRIPT/SRC="%(jscript)s"></SCRIPT>
        <iframe src="javascript:javascript:alert('ThisPlatformWasHacked!');"></iframe>
        </p>
      HTML
      features = %i[title alignment list decoration link video]
      expect(service.sanitize(input, features)).not_to include "<iframe src=\"javascript:javascript:alert('ThisPlatformWasHacked!');\"></iframe>"
    end

    describe 'URL scheme allowlist' do
      it 'drops javascript: hrefs on links but keeps the text' do
        input = '<a href="javascript:alert(1)">click</a>'
        output = service.sanitize(input, [:link])
        expect(output).not_to include('javascript:')
        expect(output).to include('click')
      end

      it 'drops data: hrefs on links' do
        input = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>'
        output = service.sanitize(input, [:link])
        expect(output).not_to include('data:text/html')
      end

      it 'keeps http, https, mailto and relative hrefs on links' do
        ['https://example.com', 'http://example.com', 'mailto:a@b.com', '/relative', '#frag'].each do |href|
          output = service.sanitize(%(<a href="#{href}">x</a>), [:link])
          expect(output).to include(%(href="#{href}"))
        end
      end

      it 'drops javascript: src on images' do
        input = '<img src="javascript:alert(1)">'
        expect(service.sanitize(input, [:image])).not_to include('javascript:')
      end

      it 'keeps data:image base64 src on images' do
        input = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'
        expect(service.sanitize(input, [:image])).to include('data:image/gif;base64')
      end
    end

    describe 'CSS scrubbing of the style attribute' do
      it 'drops javascript: URLs inside style' do
        input = '<img src="/x.png" style="background:url(javascript:alert(1))">'
        expect(service.sanitize(input, [:image])).not_to include('javascript:')
      end

      it 'drops CSS expression() inside style' do
        input = '<img src="/x.png" style="width:expression(alert(1))">'
        expect(service.sanitize(input, [:image])).not_to include('expression(')
      end

      it 'drops position/offset properties usable for clickjacking overlays' do
        input = '<img src="/x.png" style="position:fixed;top:0;left:0;width:100vw;height:100vh">'
        output = service.sanitize(input, [:image])
        expect(output).not_to include('position:')
        expect(output).not_to include('top:')
      end
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
        <p><img src="data:image/png;base64,#{base64_test_image}"></p>
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete trailing iframes wrapped in p' do
      html = <<~HTML
        <p>qweqweqweqwe</p>
        "
        <p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//wwwXyoutube.com/embed/IqajIYxbPOI" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe></p>
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end

    it 'doesn\'t delete trailing iframes' do
      html = <<~HTML
        <p>qweqweqweqwe</p>
        "
        <iframe class="ql-video" frameborder="0" allowfullscreen="true" src="//wwwXyoutube.com/embed/IqajIYxbPOI" data-blot-formatter-unclickable-bound="true" width="497" height="248.5" style="display:block;margin:auto;cursor:nwse-resize;" data-align="center"></iframe>
      HTML
      output = service.remove_empty_trailing_tags(html)
      expect(output).to eq html
    end
  end

  describe 'linkify' do
    it 'transforms a plan-text link to an anchor' do
      html = '<p>https://www.google.com</p>'
      output = service.linkify(html)
      expect(output).to eq '<p><a href="https://www.google.com" target="_blank" rel="noreferrer noopener nofollow">https://www.google.com</a></p>'
    end

    it 'transforms plain-text links with one domain segment' do
      html = '<p>http://localhost:3000/ideas</p>'
      output = service.linkify(html)
      expect(output).to eq '<p><a href="http://localhost:3000/ideas" target="_blank" rel="noreferrer noopener nofollow">http://localhost:3000/ideas</a></p>'
    end

    it "doesn't transforms an existing anchor" do
      html = '<p><a href="https://www.google.com" target="_blank" rel="noreferrer noopener nofollow">https://www.google.com</a></p>'
      output = service.linkify(html)
      expect(output).to eq html
    end

    it 'transforms an email to a mailto: anchor' do
      html = '<p>hello@citizenlab.co</p>'
      output = service.linkify(html)
      expect(output).to eq '<p><a href="mailto:hello@citizenlab.co" target="_blank" rel="noreferrer noopener nofollow">hello@citizenlab.co</a></p>'
    end
  end

  describe 'sanitize_body_multiloc' do
    # One input exercising all three steps: the script tag is sanitized away, the bare URL is
    # linkified, and the empty trailing `<p>` is dropped.
    it 'runs the sanitize, trailing-tag and linkify steps' do
      output = service.sanitize_body_multiloc(
        { 'en' => '<p>See https://example.com</p><script>alert(1)</script><p></p>' }, %i[mention]
      )
      expect(output['en']).to eq(
        '<p>See <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">https://example.com</a></p>alert(1)'
      )
    end

    # Public API responses distinguish '' from nil, so this must not drift.
    it 'turns a nil locale value into an empty string, not nil' do
      output = service.sanitize_body_multiloc({ 'en' => '<p>hi</p>', 'nl-NL' => nil }, %i[mention])
      expect(output).to eq({ 'en' => '<p>hi</p>', 'nl-NL' => '' })
    end
  end

  describe 'replace_links_with_urls' do
    it 'replaces a link with the URL it points at' do
      expect(service.replace_links_with_urls('<a href="https://example.com">click here</a>')).to eq 'https://example.com'
    end

    # Without the scheme: `linkify` matches an email by its address alone and adds the `mailto:`
    # back itself, so leaving one on here strands it in front of the rebuilt link as visible text.
    it 'replaces a mailto link with its address, without the scheme' do
      expect(service.replace_links_with_urls('<a href="mailto:a@b.com">schrijf ons</a>')).to eq 'a@b.com'
    end

    # `linkify` never builds these, so putting one back as text would invent a link the pipeline
    # would not have made. Left alone, the anchor is dropped downstream like any other markup.
    it 'leaves a javascript: link alone' do
      input = '<a href="javascript:alert(1)">click</a>'
      expect(service.replace_links_with_urls(input)).to eq input
    end

    it 'leaves a relative link alone' do
      input = '<a href="/somewhere">click</a>'
      expect(service.replace_links_with_urls(input)).to eq input
    end

    it 'leaves text without links alone' do
      expect(service.replace_links_with_urls('<p>no links here</p>')).to eq '<p>no links here</p>'
    end

    it 'returns nil for nil' do
      expect(service.replace_links_with_urls(nil)).to be_nil
    end

    # The comment-translation pipeline, which is the only caller. It runs on every save and over
    # stored rows in bulk, so a value it has already been through has to come back untouched -
    # a label the rebuild does not reproduce exactly grows by one copy on every pass.
    describe 'feeding the rebuilt link back through the pipeline' do
      def round_trip(html)
        service.sanitize_body(service.replace_links_with_urls(html), Comment::BODY_SANITIZE_FEATURES)
      end

      %w[https://example.com/x mailto:a@b.com].each do |href|
        it "settles after one pass for #{href}" do
          once = round_trip(%(<a href="#{href}">een vertaald label</a>))
          expect(round_trip(once)).to eq once
        end
      end

      it 'shows a mailto link as its address, with no scheme in the visible text' do
        output = round_trip('<a href="mailto:a@b.com">schrijf ons</a>')
        expect(output).to eq '<a href="mailto:a@b.com" target="_blank" rel="noreferrer noopener nofollow">a@b.com</a>'
      end
    end
  end

  describe 'strip_to_plain_text' do
    # Built by escape rather than pasted, so the character survives every editor this file passes
    # through, and a failure message can be told apart from a plain space.
    let(:nbsp) { "\u00A0" }

    it 'removes markup' do
      expect(service.strip_to_plain_text('<b>Bold</b> idea')).to eq 'Bold idea'
    end

    it 'does not entity-encode the text that survives' do
      expect(service.strip_to_plain_text('Fish & chips: budget > 100 < 200')).to eq 'Fish & chips: budget > 100 < 200'
    end

    it 'is idempotent' do
      once = service.strip_to_plain_text('<b>Fish</b> & chips')
      expect(service.strip_to_plain_text(once)).to eq once
    end

    it 'neutralises a payload hidden behind entity encoding' do
      expect(service.strip_to_plain_text('&lt;img src=x onerror=alert(1)&gt;hi')).to eq 'hi'
    end

    it 'returns nil for nil, like sanitize does' do
      expect(service.strip_to_plain_text(nil)).to be_nil
    end

    it 'leaves no parsable tag even for deeply nested encodings' do
      output = service.strip_to_plain_text('&amp;amp;amp;amp;amp;lt;script&amp;amp;amp;amp;amp;gt;')
      expect(output).not_to match(/<[a-zA-Z]/)
    end

    # French typography puts a non-breaking space before ':' and inside numbers, so this is ordinary
    # copy, and the HTML5 serializer writes it as `&nbsp;` every time it round-trips.
    it 'keeps a non-breaking space as one character rather than its entity' do
      title = "Analyse des options + vote#{nbsp}: 920#{nbsp}000 $"
      expect(service.strip_to_plain_text(title)).to eq title
    end

    it 'is idempotent over a non-breaking space' do
      once = service.strip_to_plain_text("vote#{nbsp}: la place")
      expect(service.strip_to_plain_text(once)).to eq once
    end

    it 'decodes a non-breaking space that arrives already encoded' do
      expect(service.strip_to_plain_text('vote&nbsp;: la place')).to eq "vote#{nbsp}: la place"
    end

    it 'strips a payload sitting next to a non-breaking space' do
      expect(service.strip_to_plain_text("<img src=x onerror=alert(1)>vote#{nbsp}: la place"))
        .to eq "vote#{nbsp}: la place"
    end

    it 'leaves no parsable tag when a payload is encoded around a non-breaking space' do
      output = service.strip_to_plain_text("&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;#{nbsp}x")
      expect(output).not_to match(/<[a-zA-Z]/)
    end
  end

  describe 'strip_multiloc_to_plain_text' do
    it 'strips every locale and keeps a nil value nil' do
      output = service.strip_multiloc_to_plain_text(
        { 'en' => '<b>Fish</b> & chips', 'fr-BE' => '<img src=x onerror=alert(1)>frites', 'nl-NL' => nil }
      )
      expect(output).to eq({ 'en' => 'Fish & chips', 'fr-BE' => 'frites', 'nl-NL' => nil })
    end

    # A row is sanitised as a whole, so a payload in one locale must not cost a clean locale its
    # non-breaking spaces.
    it 'leaves a clean locale untouched while stripping a payload from another' do
      nbsp = "\u00A0"
      output = service.strip_multiloc_to_plain_text(
        { 'en' => '<img src=x onerror=alert(1)>frites', 'fr-BE' => "vote#{nbsp}: la place" }
      )
      expect(output).to eq({ 'en' => 'frites', 'fr-BE' => "vote#{nbsp}: la place" })
    end
  end
end
