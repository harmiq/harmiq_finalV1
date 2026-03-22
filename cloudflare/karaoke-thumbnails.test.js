// karaoke-thumbnails.test.js
const fs = require('fs');
const { JSDOM } = require('jsdom');

describe('Karaoke video thumbnails', () => {
  let document;
  beforeAll(() => {
    const html = fs.readFileSync('cloudflare/karaoke-eventos.html', 'utf-8');
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    console.log('renderKaraokeVideos type:', typeof window.renderKaraokeVideos);
    const { window } = dom;
    window.renderKaraokeVideos();
  });

  test('each video card has an img with correct src and class', () => {
    const imgs = document.querySelectorAll('.card img.karaoke-thumbnail');
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach(img => {
      expect(img.src).toMatch(/https:\/\/img\.youtube\.com\/vi\/[^/]+\/mqdefault\.jpg/);
      expect(img.getAttribute('alt')).not.toBeNull();
    });
  });
});
