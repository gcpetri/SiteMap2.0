/* eslint-disable no-useless-escape */
export const config = {
  default_regex: [
    {
      reg: '[N,W]?\\s*?-?\\d+\\.\\d{4,}o?\\s*,\\s*[N,W]?\\s*-?\\d+\\.\\d{4,}',
      matches: ['N 29.45017o, W -98.69689', 'W -99.2343 , N 35.2354'],
    }
  ],
  contact: {
    name: 'Gregory Petri',
    email: 'gcpetri@outlook.com',
    git: 'https://github.com/gcpetri',
  },
  kml_tag_options: ['Placemark', 'GroundOverlay', 'PhotoOverlay', 'ScreenOverlay', 'NetworkLink'],
  default_kml_tag_options: ['Placemark', 'GroundOverlay'],
  kml_header: `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n<Document>\n`,
  kml_footer: `\n</Document></kml>`,
  // pointStyle: '\n<Style id="Point-Style"><IconStyle><scale>0.8</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-blank.png</href></Icon></IconStyle></Style>',
  // pointStyleUrl: '<styleUrl>#Point-Style</styleUrl>',
  kml_default_style_ids: ['sn_icon28', 'sn_icon2820', 'msn_icon28', 'msn_icon2800', 'sh_icon28', 'sh_icon2810'],
  kml_default_styles: {
    sn_icon28: 
      `<Style id="sn_icon28">
        <IconStyle>
          <color>ff0000ff</color>
          <scale>1.1</scale>
          <Icon>
            <href>files/icon28_01.png</href>
          </Icon>
        </IconStyle>
      </Style>`,
    sn_icon2820: 
      `<Style id="sn_icon2820">
        <IconStyle>
          <color>ff0000ff</color>
          <scale>1.1</scale>
          <Icon>
            <href>files/icon28.png</href>
          </Icon>
        </IconStyle>
      </Style>`,
    msn_icon28: 
      `<StyleMap id="msn_icon28">
        <Pair>
          <key>normal</key>
          <styleUrl>#sn_icon28</styleUrl>
        </Pair>
        <Pair>
          <key>highlight</key>
          <styleUrl>#sh_icon28</styleUrl>
        </Pair>
      </StyleMap>`,
    msn_icon2800: 
      `<StyleMap id="msn_icon2800">
          <Pair>
          <key>normal</key>
          <styleUrl>#sn_icon2820</styleUrl>
        </Pair>
        <Pair>
          <key>highlight</key>
          <styleUrl>#sh_icon2810</styleUrl>
        </Pair>
      </StyleMap>`,
    sh_icon28: 
      `<Style id="sh_icon28">
        <IconStyle>
          <color>ff0000ff</color>
          <scale>1.3</scale>
          <Icon>
            <href>files/icon28_01.png</href>
          </Icon>
        </IconStyle>
      </Style>`,
    sh_icon2810: 
      `<Style id="sh_icon2810">
        <IconStyle>
          <color>ff0000ff</color>
          <scale>1.3</scale>
          <Icon>
            <href>files/icon28.png</href>
          </Icon>
        </IconStyle>
      </Style>`,
  },
};

