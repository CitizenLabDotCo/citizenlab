module EmailCampaigns
  class UserDigestMailerPreview < ActionMailer::Preview
    def campaign_mail
      command = {
        recipient: User.first,
        event_payload: {
          notifications_count: 2,
          top_ideas: [
            {
              title_multiloc: {
                "nl-BE" => "Beweegbank op de Kessel-Lo Falls"
              },
              body_multiloc: {
                "nl-BE" => "<p> </p><p>Dankzij “kom op voor je wijk” hebben wij een prachtig initiatief verwezenlijkt in Kessel-Lo namelijk de Kessel-Lo Falls. De Kessel-Lo Falls is uitgegroeid tot een plaats waar buurtbewoners zich verzamelen. Dit voor een gezellige barbecue, moes tuinieren, racen van de heuvels, rustig een boekje lezen of spelen met de kipjes. Onze 6 sierkipjes zijn een aantrekpleisters voor kindjes uit de beurt. Ook onze pilates lessen tijdens de zomer trokken maar liefst meer dan 30 sportievelingen. Of er nu gevoetbald, gehonkbald, gelopen of gesquasht wordt. De beweegbank is een zeer mooie toegevoegde waarde voor onze sportieve buurtbewoners. </p><p>Op de Falls is er meer dan plaats genoeg voor de beweegbank. Enerzijds bij onze goal, anderzijds aan de straatkant (dichtbij de passerende joggers), langs de moestuin of gezellig bij onze kipjes. De exacte plaats laten we graag gezamenlijk door de buurtbewoners beslissen. Alvast hartelijk bedankt om onze aanvraag in overweging te nemen. Het Kessel-Lo Falls team. </p><p> </p>"
              },
              author_name: "Chris Beenders",
              upvotes_count: 7,
              downvotes_count: 0,
              comments_count: 1,
              published_at: "2019-09-08T07:40:11Z",
              url: "http://localhost:3000/nl-BE/ideas/beweegbank-op-de-kessel-lo-falls",
              idea_images: [
                {
                  ordering: 0,
                  versions: {
                    small: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/small_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg",
                    medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/medium_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg",
                    large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/large_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg",
                    fb: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/4daa57c2-b68c-464f-a6a5-979007360276/fb_58883525-9db0-48dc-bc51-9d37f91b38ae.jpeg"
                  }
                }
              ],
              top_comments: [
                {
                  body_multiloc: {
                    "nl-BE" => "Je had beter de correcte locatie ingevuld, nu staat je vlaggetje op de kaart op de Diestsesteenweg.\nVolgens mij gaat het hier over de gezusters Grégoirestraat aan de foto te zien..."
                  },
                  created_at: "2019-09-09T09:24:02Z",
                  author_first_name: "Evelien",
                  author_last_name: "Lievers",
                  author_locale: "nl-BE",
                  author_avatar: {
                    small: nil,
                    medium: nil,
                    large: nil
                  }
                },
                {
                  body_multiloc: {
                    "nl-BE" => "Je had beter de correcte locatie ingevuld, nu staat je vlaggetje op de kaart op de Diestsesteenweg.\nVolgens mij gaat het hier over de gezusters Grégoirestraat aan de foto te zien..."
                  },
                  created_at: "2019-09-09T09:24:02Z",
                  author_first_name: "Evelien",
                  author_last_name: "Lievers",
                  author_locale: "nl-BE",
                  author_avatar: {
                    small: nil,
                    medium: nil,
                    large: nil
                  }
                }
              ]
            },
            {
              title_multiloc: {
                "nl-BE" => "Beweegbank thv park tussen Slachthuislaan en Arthur de Greefstraat"
              },
              body_multiloc: {
                "nl-BE" => "<p>Een beweegbank zou geweldig passen op deze locatie vanwege de nabijheid van oa. WGC Caleido, lagere school Grasmushof, Redingenhof en fitness JIMS. De jongeren van het Redingenhof die geregeld op deze site hun middagpauze nemen krijgen via een beweegbank de mogelijkheid tot een actieve (en betaalbare) middagpauze. Ook cliënten van JIMS kunnen bij goed weer van de bank gebruik maken om een deeltje van hun training in openlucht uit te voeren. WGC Caleido zou zich daarnaast ten volle willen inzetten in het kader van kinesitherapie om patiënten toe te leiden tot het gebruik van de bank. Op die manier draagt men bij tot een buurtgerichte werking waarin patiënten, buurtbewoners en zorgverleners worden geïnspireerd en gestimuleerd tot een actieve levensstijl met alle positieve gevolgen op termijn.</p>"
              },
              author_name: "Katrien Van Pamel",
              upvotes_count: 12,
              downvotes_count: 0,
              comments_count: 1,
              published_at: "2019-09-05T07:14:19Z",
              url: "http://localhost:3000/nl-BE/ideas/beweegbank-thv-park-tussen-slachthuislaan-en-arthur-de-greefstraat",
              idea_images: [
                {
                  ordering: 0,
                  versions: {
                    small: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/d615ff83-fdef-46b4-9599-1bf9b779d6c3/small_f5e76314-97d5-4746-b87a-33581cd70e0b.jpeg",
                    medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/d615ff83-fdef-46b4-9599-1bf9b779d6c3/medium_f5e76314-97d5-4746-b87a-33581cd70e0b.jpeg",
                    large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/d615ff83-fdef-46b4-9599-1bf9b779d6c3/large_f5e76314-97d5-4746-b87a-33581cd70e0b.jpeg",
                    fb: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/idea_image/image/d615ff83-fdef-46b4-9599-1bf9b779d6c3/fb_f5e76314-97d5-4746-b87a-33581cd70e0b.jpeg"
                  }
                }
              ],
              top_comments: [
                {
                  body_multiloc: {
                    "nl-BE" => "Prima locatie voor dit initiatief."
                  },
                  created_at: "2019-09-06T07:48:02Z",
                  author_first_name: "Arlette",
                  author_last_name: "Cornière",
                  author_locale: "nl-BE",
                  author_avatar: {
                    small: nil,
                    medium: nil,
                    large: nil
                  }
                }
              ]
            },
            {
              title_multiloc: {
                "nl-BE" => "Keizersberg beweegbank"
              },
              body_multiloc: {
                "nl-BE" => "<p>hoi, ikv heropwaardering keizersberg en midden in natuur zou beweegbank super zijn. Eerst aanloop naar boven en daar dan in alle rust oefeningen kunnen doen</p>"
              },
              author_name: "Cindy Colla",
              upvotes_count: 2,
              downvotes_count: 0,
              comments_count: 0,
              published_at: "2019-09-09T07:38:19Z",
              url: "http://localhost:3000/nl-BE/ideas/keizersberg-beweegbank",
              idea_images: [],
              top_comments: []
            }
          ],
          discover_projects: [
            {
              title_multiloc: {
                "en" => "Beweegbanken in Leuven",
                "nl-BE" => "Beweegbanken in Leuven"
              },
              url: "http://localhost:3000/nl-BE/projects/beweegbanken-in-leuven",
              created_at: "2019-08-13T07:35:06Z"
            },
            {
              title_multiloc: {
                "en" => "Leuven, maak het mee!",
                "nl-BE" => "Leuven, maak het mee!"
              },
              url: "http://localhost:3000/nl-BE/projects/betrokken-en-participatieve-stad",
              created_at: "2019-01-25T14:49:09Z"
            }
          ],
          new_initiatives: [
            {
              id: "dea0620a-f5b0-4ee0-9c44-2466742eceb7",
              title_multiloc: {
                "en" => "Werkelijke milieukost doorrekenen op alle producten"
              },
              url: "http://localhost:3000/initiatives/werkelijke-milieukost-doorrekenen-op-alle-producten-1",
              published_at: "2019-09-09T13:04:49Z",
              author_name: "Sebi Hoorens",
              upvotes_count: 1,
              comments_count: 0,
              images: [
                {
                  ordering: nil,
                  versions: {
                    small: "https://res.cloudinary.com/citizenlabco/image/upload/v1607443075/small_7d3bb3ca-32eb-4ba1-9de6-3bc738e4bad6_qhh6up.jpg",
                    medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/76082065-961f-415e-8fbe-a7b2cbef34ab/medium_57f51b02-2314-4b7c-8835-9c0435a84138.jpeg",
                    large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/76082065-961f-415e-8fbe-a7b2cbef34ab/large_57f51b02-2314-4b7c-8835-9c0435a84138.jpeg",
                    fb: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/76082065-961f-415e-8fbe-a7b2cbef34ab/fb_57f51b02-2314-4b7c-8835-9c0435a84138.jpeg"
                  }
                }
              ],
              header_bg: {
                versions: {
                  large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/dea0620a-f5b0-4ee0-9c44-2466742eceb7/large_7bdd322e-a320-4d12-980b-52f2bea10a46.jpeg",
                  medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/dea0620a-f5b0-4ee0-9c44-2466742eceb7/medium_7bdd322e-a320-4d12-980b-52f2bea10a46.jpeg",
                  small: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/dea0620a-f5b0-4ee0-9c44-2466742eceb7/small_7bdd322e-a320-4d12-980b-52f2bea10a46.jpeg"
                }
              }
            },
            {
              id: "61bdec68-222e-47b2-8933-6d0ca61410eb",
              title_multiloc: {
                "en" => "Werkelijke milieukost doorrekenen op alle producten"
              },
              url: "http://localhost:3000/initiatives/werkelijke-milieukost-doorrekenen-op-alle-producten",
              published_at: "2019-09-09T12:50:44Z",
              author_name: "Sebi Hoorens",
              upvotes_count: 5,
              comments_count: 2,
              images: [
                {
                  ordering: nil,
                  versions: {
                    small: "https://res.cloudinary.com/citizenlabco/image/upload/v1607443075/small_7d3bb3ca-32eb-4ba1-9de6-3bc738e4bad6_qhh6up.jpg",
                    medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/27dabd91-ff40-4ce8-9c99-38695d2f3fa5/medium_14330b58-2421-474b-9f67-a9031d5505cf.jpeg",
                    large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/27dabd91-ff40-4ce8-9c99-38695d2f3fa5/large_14330b58-2421-474b-9f67-a9031d5505cf.jpeg",
                    fb: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/27dabd91-ff40-4ce8-9c99-38695d2f3fa5/fb_14330b58-2421-474b-9f67-a9031d5505cf.jpeg"
                  }
                }
              ],
              header_bg: {
                versions: {
                  large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/61bdec68-222e-47b2-8933-6d0ca61410eb/large_59efc040-71ad-480e-b356-3adb36b83ec2.jpeg",
                  medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/61bdec68-222e-47b2-8933-6d0ca61410eb/medium_59efc040-71ad-480e-b356-3adb36b83ec2.jpeg",
                  small: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/61bdec68-222e-47b2-8933-6d0ca61410eb/small_59efc040-71ad-480e-b356-3adb36b83ec2.jpeg"
                }
              }
            }
          ],
          successful_initiatives: [
            {
              id: "61bdec68-222e-47b2-8933-6d0ca61410eb",
              title_multiloc: {
                "en" => "Werkelijke milieukost doorrekenen op alle producten"
              },
              url: "http://localhost:3000/initiatives/werkelijke-milieukost-doorrekenen-op-alle-producten",
              published_at: "2019-09-09T12:50:44Z",
              author_name: "Sebi Hoorens",
              upvotes_count: 5,
              comments_count: 2,
              threshold_reached_at: "2019-09-09T14:15:46Z",
              images: [
                {
                  ordering: nil,
                  versions: {
                    small: "https://res.cloudinary.com/citizenlabco/image/upload/v1607443075/small_7d3bb3ca-32eb-4ba1-9de6-3bc738e4bad6_qhh6up.jpg",
                    medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/27dabd91-ff40-4ce8-9c99-38695d2f3fa5/medium_14330b58-2421-474b-9f67-a9031d5505cf.jpeg",
                    large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/27dabd91-ff40-4ce8-9c99-38695d2f3fa5/large_14330b58-2421-474b-9f67-a9031d5505cf.jpeg",
                    fb: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative_image/image/27dabd91-ff40-4ce8-9c99-38695d2f3fa5/fb_14330b58-2421-474b-9f67-a9031d5505cf.jpeg"
                  }
                }
              ],
              header_bg: {
                versions: {
                  large: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/61bdec68-222e-47b2-8933-6d0ca61410eb/large_59efc040-71ad-480e-b356-3adb36b83ec2.jpeg",
                  medium: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/61bdec68-222e-47b2-8933-6d0ca61410eb/medium_59efc040-71ad-480e-b356-3adb36b83ec2.jpeg",
                  small: "http://localhost:4000/uploads/59cbf3fa-8028-43cc-b5a1-fba42bdaac01/initiative/header_bg/61bdec68-222e-47b2-8933-6d0ca61410eb/small_59efc040-71ad-480e-b356-3adb36b83ec2.jpeg"
                }
              }
            }
          ]
        }
      }
      campaign = EmailCampaigns::Campaigns::UserDigest.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
