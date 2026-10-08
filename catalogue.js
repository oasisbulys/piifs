export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
export const slug = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const topicTitles = {
  'N-KXStupwsc':'The Cubic Formula',
  pNt5Ll6hGqo:'Counting Rules and Mappings',
  '09yIb3VHhMI':'Counting Rules and Combinations',
  SmFwFdESMHI:'Introduction to Probability'
};

export function cleanTitle(lecture) {
  if (topicTitles[lecture.id]) return topicTitles[lecture.id];
  return lecture.title
    .replace(/^(?:(?:Calculus\s+\d+|Statistics|Intermediate Algebra)\s+)?(?:Lecture|Lec)\s+\d+(?:\.\d+)*\s*:\s*/i,'')
    .replace(/\s*\|\s*(?:Chapter\s+\d+.*|MIT\s+.*)$/i,'')
    .replace(/\s*\((?:Precalculus\s*-\s*College Algebra|Differential Equations)\s+\d+\)\s*$/i,'')
    .replace(/\s*\(TTP(?:\s+Video)?\s+\d+\)\s*$/i,'')
    .replace(/\b(Group Theory|Rings and Modules)\s+\d+$/i,'$1')
    .replace(/,\s*Algebra\s+\d+$/i,'')
    .replace(/Schrodinger/g,'Schrödinger')
    .replace(/\s+/g,' ').trim();
}

export function cleanChapter(value) {
  return value.replace(/^(?:ALG-)?\d+[A-Z]?\s*-\s*/,'').replace(/^Formative\s*-\s*/,'').replace(/Schrodinger/,'Schrödinger').replace(/^Cell The Unit of Life$/,'Cell: The Unit of Life').replace(/^Organic Chemistry Basic Principles and Techniques$/,'Organic Chemistry: Basic Principles and Techniques');
}

function chaptersFor(lectures, descriptions = {}) {
  const chapters = new Map();
  for (const lecture of lectures) {
    const title = cleanChapter(lecture.chapter);
    const id = slug(title);
    if (!chapters.has(id)) chapters.set(id, {id,title,description:descriptions[title] || '',lectures:[]});
    chapters.get(id).lectures.push({...lecture,title:cleanTitle(lecture)});
  }
  return [...chapters.values()];
}

export function makeCatalogue(math, algebra, science, images) {
  const definitions = [
    {id:'general-mathematics',title:'General Mathematics',description:'Polynomials, inequalities, linear algebra, groups, fields and the ideas of calculus.',source:'Selected lectures in algebra and calculus.',lectures:[...algebra.days.flatMap(day => day.lectures),...math.lessons.filter(lecture => lecture.teacher === '3Blue1Brown' && lecture.chapter.includes('Limits and Derivatives')).map(lecture => ({...lecture,chapter:'Calculus'}))],descriptions:Object.fromEntries(algebra.days.map(day => [cleanChapter(day.lectures[0]?.chapter || day.title),day.topics]))},
    {id:'academic-mathematics',title:'Academic Mathematics',description:'The mathematics library: sets and functions, trigonometry, algebra, geometry, calculus, statistics and probability.',source:'School mathematics with supplementary university lectures.',lectures:math.lessons},
    {id:'general-biology',title:'General Biology',description:'Diversity, cells and biomolecules, plant biology, human physiology and neural systems.',source:'MIT, Yale, UC San Diego, Stanford and school-level lectures.',lectures:science.biology},
    {id:'chemistry',title:'Chemistry',description:'Atomic structure, bonding, thermodynamics, equilibrium, redox, organic chemistry and reaction kinetics.',source:'MIT OpenCourseWare and Monica Bedi’s organic chemistry lectures.',lectures:science.chemistry}
  ];
  return definitions.map(({lectures,descriptions,...course}) => {
    const chapters=chaptersFor(lectures,descriptions);
    if (course.id === 'chemistry') {
      const sequence=['Chemical Principles','Structure of Atom','Classification and Periodicity','Chemical Bonding and Molecular Structure','Chemical Thermodynamics','Equilibrium','Redox Reactions','Organic Chemistry: Basic Principles and Techniques','Atomic Theory and Quantum Chemistry','Transition Metals','Chemical Kinetics'];
      chapters.sort((a,b)=>sequence.indexOf(a.title)-sequence.indexOf(b.title));
    }
    return {...course,art:images.find(image => image.course === course.title),chapters};
  });
}

export function lectureURL(course, chapter, lecture) {
  return `#lecture/${course.id}/${chapter.id}/${lecture.id}`;
}

export function lectureMeta(lecture) {
  const parts = [lecture.teacher];
  if (lecture.published && /^\d{8}$/.test(lecture.published)) {
    const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    parts.push(`${Number(lecture.published.slice(6))} ${months[Number(lecture.published.slice(4,6))-1]} ${lecture.published.slice(0,4)}`);
  }
  if (lecture.duration) parts.push(`${Math.round(lecture.duration/60)} minutes`);
  return parts.filter(Boolean).join(' · ');
}
