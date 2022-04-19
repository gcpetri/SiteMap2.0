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
};

