# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:replace_de_DE_content_builder_layout_multilocs_with_de_AT rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:replace_de_DE_content_builder_layout_multilocs_with_de_AT'].reenable
    FileUtils.rm_f(report_path)
  end

  def run_task(host: Tenant.current.host, execute: false)
    Rake::Task['single_use:replace_de_DE_content_builder_layout_multilocs_with_de_AT'].invoke(host, execute ? 'execute' : nil)
  end

  def configure_locales(locales)
    config = AppConfiguration.instance
    settings = config.settings
    settings['core']['locales'] = locales
    config.update!(settings: settings)
  end

  # Recursively counts how many times +locale+ appears as a key in a craftjs_json structure.
  def count_locale_keys(node, locale)
    case node
    when Hash
      (node.key?(locale) ? 1 : 0) + node.values.sum { |value| count_locale_keys(value, locale) }
    when Array
      node.sum { |value| count_locale_keys(value, locale) }
    else
      0
    end
  end

  let(:report_path) { Rails.root.join('replace_de_DE_content_builder_layout_multilocs_with_de_AT.json') }

  # The fixture layout below holds nine de-DE multiloc entries.
  let(:de_de_multiloc_count) { 9 }

  # rubocop:disable Layout/LineLength
  let(:layout) do
    create(
      :layout,
      craftjs_json: {
        'ROOT' => {
          'type' => 'div',
          'nodes' => ['cQ7B9OiL6q'],
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'custom' => {},
          'hidden' => false,
          'isCanvas' => true,
          'displayName' => 'div',
          'linkedNodes' => {}
        },
        '8qhxAZ6Ysq' => {
          'type' => { 'resolvedName' => 'Container' },
          'nodes' => %w[lMgNYhwKjO oT3kYcuEih H1mI5U3uxO P8leKzLn-p _RsmiKRawy cMZA62_7aq],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => 'cQ7B9OiL6q',
          'isCanvas' => true,
          'displayName' => 'H',
          'linkedNodes' => {}
        },
        'C4MK7Cf2mp' => {
          'type' => { 'resolvedName' => 'Box' },
          'nodes' => [],
          'props' => {
            'style' => {
              'margin' => '0 auto',
              'padding' => '0px 0px',
              'maxWidth' => '1200px'
            }
          },
          'custom' => {},
          'hidden' => false,
          'parent' => 'aqrm7HVO0L',
          'isCanvas' => true,
          'displayName' => 'Box',
          'linkedNodes' => {}
        },
        'H1mI5U3uxO' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {},
            'title' => { 'de-DE' => 'Wie läuft die Kampagne ab?' }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            },
            'hasChildren' => true
          },
          'hidden' => false,
          'parent' => '8qhxAZ6Ysq',
          'isCanvas' => false,
          'displayName' => 'je',
          'linkedNodes' => { 'accordion-content' => 'KSl9S2_VzJ' }
        },
        'J6w8-gWyAV' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {
              'de-DE' => '<p><br></p><p>LinzOptimal, ist unsere <strong>interne Beteiligungskampagne</strong>, die <strong>einmal im Jahr</strong> stattfindet. In einem klar definierten Prozess sammeln wir gemeinsam Ideen, bewerten sie und setzen die besten Ideen konkret um.</p><p>Hier können Sie Informationen einsehen, den Kampagnenverlauf verfolgen und natürlich <strong>Ideen einbringen</strong> – direkt und unkompliziert.</p><p>⬇️🟣 Einfach <strong>runterscrollen</strong> um die aktuelle Phase zu sehen 🟣⬇️</p>'
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => 'JaW1oGZjhu',
          'isCanvas' => false,
          'displayName' => 'Mn',
          'linkedNodes' => {}
        },
        'JaW1oGZjhu' => {
          'type' => { 'resolvedName' => 'Container' },
          'nodes' => ['J6w8-gWyAV'],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => 'cQ7B9OiL6q',
          'isCanvas' => true,
          'displayName' => 'H',
          'linkedNodes' => {}
        },
        'KSl9S2_VzJ' => {
          'type' => { 'resolvedName' => 'Container' },
          'nodes' => %w[_g-xULHo-j aqrm7HVO0L],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => 'H1mI5U3uxO',
          'isCanvas' => true,
          'displayName' => 'H',
          'linkedNodes' => {}
        },
        'P8leKzLn-p' => {
          'type' => { 'resolvedName' => 'ImageTextCards' },
          'nodes' => [],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => '8qhxAZ6Ysq',
          'isCanvas' => false,
          'displayName' => 'se',
          'linkedNodes' => { 'image-text-cards' => 'mBSgqSHa8B' }
        },
        'UlB8kYr-mO' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {
              'de-DE' => '<p>Sie haben Fragen zu LinzOptimal? Ihre Ansprechpartner*innen sind:</p><p>Paul Dressler: <a href="https://teams.microsoft.com/l/chat/0/0?users=paul.dressler@mag.linz.at" rel="noreferrer noopener nofollow" target="_blank">Teams</a> / <a href="mailto:paul.dressler@mag.linz.at" rel="noreferrer noopener nofollow" target="_blank">Email</a></p><p>Bettina Aichinger: <a href="https://teams.microsoft.com/l/chat/0/0?users=bettina.aichinger@mag.linz.at" rel="noreferrer noopener nofollow" target="_blank">Teams</a> / <a href="mailto:bettina.aichinger@mag.linz.at" rel="noreferrer noopener nofollow" target="_blank">Email</a></p>'
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => 'v2Regjqn3d',
          'isCanvas' => false,
          'displayName' => 'Bn',
          'linkedNodes' => {}
        },
        '_RQom0yDye' => {
          'type' => { 'resolvedName' => 'Container' },
          'nodes' => ['k9xcpCJOPH'],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => '_RsmiKRawy',
          'isCanvas' => true,
          'displayName' => 'H',
          'linkedNodes' => {}
        },
        '_RsmiKRawy' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {},
            'title' => { 'de-DE' => 'Prinzipien von LinzOptimal' }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            },
            'hasChildren' => true
          },
          'hidden' => false,
          'parent' => '8qhxAZ6Ysq',
          'isCanvas' => false,
          'displayName' => 'je',
          'linkedNodes' => { 'accordion-content' => '_RQom0yDye' }
        },
        '_g-xULHo-j' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {
              'de-DE' => '<p><strong>Schritt 1: Umfrage &amp; Stimmungsbild 📊</strong></p><p>Wir starten im März mit einer kurzen Umfrage: Wo stehen wir? Wo sehen Sie Verbesserungsbedarf? Ihre ehrliche Einschätzung bildet die Grundlage für alle weiteren Schritte.</p><p><strong>Schritt 2: Umfrage-Ergebnisse 📈</strong></p><p>Alle Erkenntnisse aus der Umfrage werden offen via LinzOptimal und im IMAG präsentiert. So wissen wir gemeinsam, welche Themen uns beschäftigen und wo wir ansetzen sollten.</p><p><strong>Schritt 3: Die große Ideensammlung💡</strong></p><p>Im April sammeln wir Ideen! Ob alleine oder im Team – entwickeln Sie kreative Ansätze und teilen Sie diese mit uns. Jede Idee zählt und bringt uns gemeinsam weiter.</p><p><strong>Schritt 4: Ideen-Shortlist 🎯</strong></p><p>Alle Ideen kommen in das sogenannte "Relevanzraster". Dort werden Punkte nach transparenten Kriterien vergeben. Die Ideen mit den höchsten Punkten werden den GB-Direktor*innen vorgelegt. Diese entscheiden, welche Ideen aktiv umgesetzt werden.</p><p><strong>Schritt 5: Ideen aktiv umsetzen 🛠️</strong></p><p>Die ausgewählten Ideen werden in Arbeitsgruppen umgesetzt – und Sie sind direkt dabei! Melden Sie sich für Themen an, die Ihnen am Herzen liegen, und gestalten Sie die Veränderung aktiv mit.</p><p><strong>Das Ziel: Der Status LinzOptimal – erreicht durch Ihre Beteiligung!</strong></p><p><br></p>'
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => 'KSl9S2_VzJ',
          'isCanvas' => false,
          'displayName' => 'Mn',
          'linkedNodes' => {}
        },
        'aqrm7HVO0L' => {
          'type' => { 'resolvedName' => 'ImageTextCards' },
          'nodes' => [],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => 'KSl9S2_VzJ',
          'isCanvas' => false,
          'displayName' => 'se',
          'linkedNodes' => { 'image-text-cards' => 'C4MK7Cf2mp' }
        },
        'cMZA62_7aq' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {},
            'title' => { 'de-DE' => 'Team' }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            },
            'hasChildren' => true
          },
          'hidden' => false,
          'parent' => '8qhxAZ6Ysq',
          'isCanvas' => false,
          'displayName' => 've',
          'linkedNodes' => { 'accordion-content' => 'v2Regjqn3d' }
        },
        'cQ7B9OiL6q' => {
          'type' => { 'resolvedName' => 'TwoColumn' },
          'nodes' => [],
          'props' => { 'columnLayout' => '1-1' },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout',
              'defaultMessage' => '2 column'
            },
            'hasChildren' => true
          },
          'hidden' => false,
          'parent' => 'ROOT',
          'isCanvas' => false,
          'displayName' => 'Se',
          'linkedNodes' => { 'left' => 'JaW1oGZjhu', 'right' => '8qhxAZ6Ysq' }
        },
        'k9xcpCJOPH' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {
              'de-DE' => "<p><strong>1. Klarheit und Transparenz</strong></p><ul>\n<li>Jede Idee wird gesichtet</li>\n<li>Jede Idee bekommt eine Rückmeldung</li>\n<li>Entscheidungskriterien sind für alle nachvollziehbar</li>\n</ul><p><strong>2. Gemeinsam gestalten</strong></p><ul>\n<li>Jede*r kann Ideen einreichen – unabhängig von Position oder Abteilung</li>\n<li>Kommentare und Ergänzungen zu bestehenden Vorschlägen sind erwünscht</li>\n</ul><p><strong>3. Respektvoller Umgang</strong></p><ul>\n<li>Wir begegnen uns auf Augenhöhe – jede Idee verdient Wertschätzung</li>\n<li>Konstruktive Kritik ist willkommen, persönliche Angriffe haben keinen Platz</li>\n<li>Unterschiedliche Perspektiven bereichern unsere Lösungen</li>\n</ul>"
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => '_RQom0yDye',
          'isCanvas' => false,
          'displayName' => 'Mn',
          'linkedNodes' => {}
        },
        'lMgNYhwKjO' => {
          'type' => { 'resolvedName' => 'AboutBox' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.participationBox',
              'defaultMessage' => 'Participation Box'
            },
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => '8qhxAZ6Ysq',
          'isCanvas' => false,
          'displayName' => 'wt',
          'linkedNodes' => {}
        },
        'mBSgqSHa8B' => {
          'type' => { 'resolvedName' => 'Box' },
          'nodes' => [],
          'props' => {
            'style' => {
              'margin' => '0 auto',
              'padding' => '0px 0px',
              'maxWidth' => '1200px'
            }
          },
          'custom' => {},
          'hidden' => false,
          'parent' => 'P8leKzLn-p',
          'isCanvas' => true,
          'displayName' => 'Box',
          'linkedNodes' => {}
        },
        'oT3kYcuEih' => {
          'type' => { 'resolvedName' => 'AccordionMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {},
            'title' => { 'de-DE' => 'Warum "LinzOptimal"?' }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc',
              'defaultMessage' => 'Accordion'
            },
            'hasChildren' => true
          },
          'hidden' => false,
          'parent' => '8qhxAZ6Ysq',
          'isCanvas' => false,
          'displayName' => 'je',
          'linkedNodes' => { 'accordion-content' => 'xg8mB9s3_l' }
        },
        'oxr_vFSAqL' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'nodes' => [],
          'props' => {
            'text' => {
              'de-DE' => '<p>Niemand kennt die täglichen Herausforderungen besser als die Menschen, die damit arbeiten. Gemeinsam decken wir Probleme auf, nutzen das volle Potenzial unserer Organisation und schaffen eine Kultur der kontinuierlichen Verbesserung. So erreichen wir den <strong>Status LinzOptimal</strong> – ein Arbeitsumfeld, in dem optimale Abläufe zur Selbstverständlichkeit werden.</p>'
            }
          },
          'custom' => {
            'title' => {
              'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
              'defaultMessage' => 'Text'
            }
          },
          'hidden' => false,
          'parent' => 'xg8mB9s3_l',
          'isCanvas' => false,
          'displayName' => 'Mn',
          'linkedNodes' => {}
        },
        'v2Regjqn3d' => {
          'type' => { 'resolvedName' => 'Container' },
          'nodes' => ['UlB8kYr-mO'],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => 'cMZA62_7aq',
          'isCanvas' => true,
          'displayName' => 'H',
          'linkedNodes' => {}
        },
        'xg8mB9s3_l' => {
          'type' => { 'resolvedName' => 'Container' },
          'nodes' => ['oxr_vFSAqL'],
          'props' => {},
          'custom' => {},
          'hidden' => false,
          'parent' => 'oT3kYcuEih',
          'isCanvas' => true,
          'displayName' => 'H',
          'linkedNodes' => {}
        }
      }
    )
  end
  # rubocop:enable Layout/LineLength

  it 'is a valid layout' do
    expect(layout).to be_valid
  end

  context 'when the tenant uses de-AT and not de-DE' do
    before { configure_locales(%w[en fr-FR de-AT]) }

    context 'in dry run mode' do
      it 'does not modify any layout' do
        layout
        expect { run_task }.not_to(change { layout.reload.craftjs_json })
      end
    end

    context 'in execute mode' do
      it 'renames every de-DE multiloc key to de-AT' do
        expect(count_locale_keys(layout.craftjs_json, 'de-DE')).to eq(de_de_multiloc_count)

        run_task(execute: true)

        updated_craftjs_json = layout.reload.craftjs_json
        expect(count_locale_keys(updated_craftjs_json, 'de-DE')).to eq(0)
        expect(count_locale_keys(updated_craftjs_json, 'de-AT')).to eq(de_de_multiloc_count)
      end

      it 'keeps the de-DE value under the new de-AT key' do
        original_title = layout.craftjs_json.dig('H1mI5U3uxO', 'props', 'title', 'de-DE')

        run_task(execute: true)

        updated_title = layout.reload.craftjs_json.dig('H1mI5U3uxO', 'props', 'title')
        expect(updated_title).not_to have_key('de-DE')
        expect(updated_title['de-AT']).to eq(original_title)
      end

      it 'writes a JSON report with the before and after craftjs_json' do
        original_craftjs_json = layout.craftjs_json

        run_task(execute: true)

        report = JSON.parse(File.read(report_path))
        change = report['changes'].find { |c| c.dig('context', 'layout_id') == layout.id }
        expect(change).to be_present
        expect(change['old_value']).to eq(original_craftjs_json)
        expect(count_locale_keys(change['old_value'], 'de-DE')).to eq(de_de_multiloc_count)
        expect(count_locale_keys(change['new_value'], 'de-AT')).to eq(de_de_multiloc_count)
      end
    end
  end

  context 'when a multiloc already has a de-AT key' do
    before { configure_locales(%w[en fr-FR de-AT]) }

    let!(:layout_with_de_at) do
      create(
        :layout,
        craftjs_json: {
          'ROOT' => {
            'type' => 'div',
            'nodes' => ['textNode'],
            'props' => {},
            'custom' => {},
            'hidden' => false,
            'isCanvas' => true,
            'displayName' => 'div',
            'linkedNodes' => {}
          },
          'textNode' => {
            'type' => { 'resolvedName' => 'TextMultiloc' },
            'nodes' => [],
            'props' => { 'text' => { 'de-DE' => '<p>Deutsch</p>', 'de-AT' => '<p>Österreichisch</p>' } },
            'custom' => {},
            'hidden' => false,
            'parent' => 'ROOT',
            'isCanvas' => false,
            'displayName' => 'Text',
            'linkedNodes' => {}
          }
        }
      )
    end

    it 'leaves the multiloc untouched' do
      run_task(execute: true)

      text = layout_with_de_at.reload.craftjs_json.dig('textNode', 'props', 'text')
      expect(text['de-DE']).to eq('<p>Deutsch</p>')
      expect(text['de-AT']).to eq('<p>Österreichisch</p>')
    end
  end

  context 'when the tenant does not use de-AT' do
    before { configure_locales(%w[en fr-FR nl-NL]) }

    it 'is a no-op and does not modify any layout' do
      layout
      expect { run_task(execute: true) }.not_to(change { layout.reload.craftjs_json })
    end
  end

  context 'when the tenant still uses de-DE' do
    before { configure_locales(%w[en fr-FR de-AT de-DE]) }

    it 'is a no-op and does not modify any layout' do
      layout
      expect { run_task(execute: true) }.not_to(change { layout.reload.craftjs_json })
    end
  end

  context 'when no tenant matches the given host' do
    before { configure_locales(%w[en fr-FR de-AT]) }

    it 'does not modify any layout' do
      layout
      expect { run_task(host: 'does-not-exist.govocal.com', execute: true) }
        .not_to(change { layout.reload.craftjs_json })
    end
  end
end
# rubocop:enable RSpec/DescribeClass
