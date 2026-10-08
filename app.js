import {makeCatalogue, escapeHTML as esc, lectureURL, lectureMeta} from './catalogue.js';
import {homePage} from './homepage.js';

const app = document.getElementById('app');
let courses = [], materials = [], images = [], museumArt = [];
const readJSON = async path => {
  const response = await fetch(path);
  if (!response.ok) throw new Error('The catalogue could not be loaded.');
  return response.json();
};
const external = (url, text, className='') => /^https:\/\//.test(url)
  ? '<a href="' + esc(url) + '" target="_blank" rel="noopener"' + (className ? ' class="' + className + '"' : '') + '>' + esc(text) + '</a>'
  : esc(text);
const imageMarkup = course => '<img src="' + esc(course.art.display) + '" alt="' + esc(course.art.alt) + '" width="300" height="100" style="object-position:' + esc(course.art.objectPosition) + '" loading="lazy" decoding="async">';
const heading = text => '<header class="page-heading"><h1 tabindex="-1">' + esc(text) + '</h1></header>';
const breadcrumb = (course, chapter) => '<p class="breadcrumb"><a href="#courses">Courses</a>' + (course ? '<span>/</span><a href="#courses/' + course.id + '">' + esc(course.title) + '</a>' : '') + (chapter ? '<span>/</span><a href="#courses/' + course.id + '/' + chapter.id + '">' + esc(chapter.title) + '</a>' : '') + '</p>';
const lectureList = (course, chapter, selected) => '<ul class="lecture-list">' + chapter.lectures.map(lecture => '<li' + (selected === lecture.id ? ' class="selected"' : '') + '><a class="lecture-link" href="' + lectureURL(course,chapter,lecture) + '"' + (selected === lecture.id ? ' aria-current="page"' : '') + '>' + esc(lecture.title) + '</a><span class="lecture-meta">' + esc(lectureMeta(lecture)) + '</span></li>').join('') + '</ul>';
const courseItem = course => '<article class="course-item"><a class="course-image" href="#courses/' + course.id + '">' + imageMarkup(course) + '</a><div class="course-copy"><h2><a href="#courses/' + course.id + '">' + esc(course.title) + '</a></h2><p>' + esc(course.description) + '</p><p class="course-source">' + esc(course.source) + '</p></div></article>';

function courseIndex() {
  return heading('Courses') + '<div class="course-list">' + courses.map(courseItem).join('') + '</div>';
}

function coursePage(course, chapter) {
  if (chapter) return breadcrumb(course) + heading(chapter.title) + (chapter.description ? '<p class="catalogue-intro">' + esc(chapter.description) + '</p>' : '') + lectureList(course,chapter) + '<p class="breadcrumb"><a href="#courses/' + course.id + '">All topics in ' + esc(course.title) + '</a></p>';
  return breadcrumb() + heading(course.title) + '<div class="course-item course-overview"><div class="course-image">' + imageMarkup(course) + '</div><div class="course-copy"><p>' + esc(course.description) + '</p><p class="course-source">' + esc(course.source) + '</p><p><a href="#materials">Reading materials</a></p></div></div><nav class="contents" aria-label="Course topics"><h2>Topics</h2><ul>' + course.chapters.map(topic => '<li><a href="#courses/' + course.id + '/' + topic.id + '">' + esc(topic.title) + '</a></li>').join('') + '</ul></nav>' + course.chapters.map(topic => '<section class="chapter-section"><h2><a href="#courses/' + course.id + '/' + topic.id + '">' + esc(topic.title) + '</a></h2>' + (topic.description ? '<p class="chapter-description">' + esc(topic.description) + '</p>' : '') + lectureList(course,topic) + '</section>').join('');
}

function lecturePage(course, chapter, lecture) {
  return breadcrumb(course,chapter) + heading(lecture.title) + '<p class="lecture-meta">' + esc(lectureMeta(lecture)) + '</p><div class="video-mount"><iframe src="https://www.youtube-nocookie.com/embed/' + lecture.id + '?rel=0&amp;playsinline=1" title="' + esc(lecture.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p class="video-source">' + external(lecture.url,'Original video') + ' · Quality and subtitles are available in the video controls.</p><section class="chapter-section"><h2>' + esc(chapter.title) + '</h2>' + lectureList(course,chapter,lecture.id) + '</section>';
}

function materialList(items) {
  return '<ul class="material-list">' + items.map(item => '<li>' + external(item.url,item.title,'material-title') + '<p class="material-meta">' + esc([item.author,item.format,item.subject].filter(Boolean).join(' · ')) + '</p>' + (item.description ? '<p class="material-meta">' + esc(item.description) + '</p>' : '') + '</li>').join('') + '</ul>';
}

function materialsPage() {
  const sections = [...new Set(materials.map(item => item.section))];
  return heading('Materials') + sections.map(section => '<section class="material-section"><h2>' + esc(section) + '</h2>' + materialList(materials.filter(item => item.section === section)) + '</section>').join('');
}

function aboutPage() {
  return heading('About') + '<div class="prose"><p>π Institute for Inquiry and Fundamental Studies (PIIFS) is a collection of lectures and reading materials in mathematics, biology and chemistry.</p><p>General Mathematics covers algebra and conceptual calculus. Academic Mathematics contains the mathematics library. General Biology and Chemistry bring together the lectures in the existing science collections.</p><p>The recordings remain with their original publishers. Lecturer and publisher credits accompany each video.</p><p>' + external('https://www.instagram.com/piifs.india/','PIIFS on Instagram · @piifs.india') + '</p></div>';
}

function creditsPage() {
  const banner=museumArt.find(art=>art.image==='art/museum-hero.jpg');
  const works=[{...banner,display:'art/display/museum-hero-960.jpg',alt:banner.title,credit:banner.artist+'. '+banner.license},...images];
  return heading('Image Credits') + works.map(image => '<article class="credit-work"><img src="' + esc(image.display || image.image) + '" alt="' + esc(image.alt) + '" loading="lazy" decoding="async"><div><h2>' + esc(image.title) + '</h2><p>' + esc(image.credit) + '</p><p>' + external(image.source,'Source image') + (image.licenseUrl ? ' · ' + external(image.licenseUrl,'Reuse terms') : '') + '</p></div></article>').join('');
}

function searchPage(query) {
  document.getElementById('site-query').value = query;
  const needles = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!needles.length) return heading('Search') + '<p>Enter a lecture title, topic, lecturer or book.</p>';
  const matches = text => needles.every(word => text.toLowerCase().includes(word));
  const results = courses.flatMap(course => course.chapters.map(chapter => ({course,chapter,lectures:chapter.lectures.filter(lecture => matches([lecture.title,lecture.teacher,chapter.title,course.title].join(' ')))}))).filter(group => group.lectures.length);
  const readings = materials.filter(item => matches([item.title,item.author,item.subject].join(' ')));
  return heading('Search') + '<p class="catalogue-intro">Results for “' + esc(query) + '”</p>' + results.map(group => '<section class="search-group"><h2>' + esc(group.course.title + ' · ' + group.chapter.title) + '</h2>' + lectureList(group.course,{...group.chapter,lectures:group.lectures}) + '</section>').join('') + (readings.length ? '<section class="search-group"><h2>Materials</h2>' + materialList(readings) + '</section>' : '') + (!results.length && !readings.length ? '<p>No matching lectures or materials.</p>' : '');
}

function render(focus=false) {
  const raw = location.hash.slice(1) || 'home';
  const parts = raw.split('/');
  let route = parts[0], html, className='';
  // Old bookmarks resolve to ordinary catalogue pages, never saved study state.
  if (['today','plan','daily-record','lecture-room'].includes(route)) route='home';
  if (['journal'].includes(route)) route='materials';
  if (['lectures','algebra'].includes(route)) {
    parts[1] = route === 'algebra' ? 'general-mathematics' : 'academic-mathematics';
    route='courses';
  }
  const course = courses.find(item => item.id === parts[1]);
  const chapter = course?.chapters.find(item => item.id === parts[2]);
  if (route === 'courses') html = course ? coursePage(course,chapter) : courseIndex();
  else if (route === 'lecture' && course && chapter) {
    const lecture = chapter.lectures.find(item => item.id === parts[3]);
    if (lecture) { html=lecturePage(course,chapter,lecture); className=' lecture-view'; }
  } else if (route === 'materials') html=materialsPage();
  else if (route === 'about') html=aboutPage();
  else if (route === 'credits') html=creditsPage();
  else if (route === 'search') {
    let query='';try {query=decodeURIComponent(parts.slice(1).join('/'));} catch {}
    html=searchPage(query);
  } else if (route === 'home') {
    html=homePage(museumArt.find(art=>art.image==='art/museum-hero.jpg'));
    className=' home-view';
  }
  if (!html) html=heading('Page not found') + '<p><a href="#courses">View the course catalogue</a>.</p>';
  app.innerHTML='<div class="content-view' + className + '">' + html + '</div>';
  for (const link of document.querySelectorAll('[data-nav]')) {
    const active=link.dataset.nav === (route === 'lecture' || route === 'search' ? 'courses' : route);
    if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  }
  const title=app.querySelector('h1')?.textContent || 'PIIFS';
  document.title=title === 'π Institute for Inquiry and Fundamental Studies' ? title : title + ' · PIIFS';
  if (focus) { window.scrollTo(0,0); app.querySelector('h1')?.focus({preventScroll:true}); }
}

document.getElementById('site-search').addEventListener('submit', event => {
  event.preventDefault();
  location.hash='search/' + encodeURIComponent(document.getElementById('site-query').value.trim());
});
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();app.focus();
});
try {
  const [math,algebra,science,art,reading,museum] = await Promise.all(['lecture-links.json','algebra-intensive.json','science-lectures.json','course-images.json','materials.json','museum-art.json'].map(readJSON));
  images=art;materials=reading;museumArt=museum;courses=makeCatalogue(math,algebra,science,art);
  render();
  addEventListener('hashchange',()=>render(true));
} catch {
  app.innerHTML='<div class="content-view">' + heading('Catalogue unavailable') + '<p>Reload the page to try again.</p></div>';
}
