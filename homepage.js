import {escapeHTML as esc} from './catalogue.js';

export function homePage(art) {
  return `<h1 class="sr-only" tabindex="-1">π Institute for Inquiry and Fundamental Studies</h1>
    <section class="home-banner" aria-label="Institute introduction">
      <img class="home-banner-art" src="art/display/museum-hero-1600.jpg" srcset="art/display/museum-hero-480.jpg 480w, art/display/museum-hero-960.jpg 960w, art/display/museum-hero-1600.jpg 1600w, art/display/museum-hero-2200.jpg 2200w" sizes="(max-width: 739px) 100vw, (max-width: 979px) 720px, 960px" width="3820" height="2964" alt="${esc(art.title)} by Raphael" fetchpriority="high" decoding="async">
      <div class="home-statement"><p><span class="opening-quote" aria-hidden="true">“</span>PIIFS brings together courses in mathematics, biology and chemistry. The mathematics collections include school-level subjects as well as algebra and calculus beyond the school curriculum. Biology ranges from cells and molecular processes to plants, animals and human physiology. Chemistry follows the structure of atoms and molecules through bonding, thermodynamics, equilibrium and reactions. Lectures are accompanied by books, papers and notes, with original sources retained throughout.<span class="closing-quote" aria-hidden="true">”</span></p></div>
    </section>
    <div class="home-columns">
      <article class="home-main" aria-label="About PIIFS">
        <p>The <a href="#about">π Institute for Inquiry and Fundamental Studies</a> brings together lectures and reading materials in mathematics, biology and chemistry. The <a href="#courses">course catalogue</a> comprises general mathematics, academic mathematics, general biology and chemistry.</p>
        <p><a href="#courses/general-mathematics">General Mathematics</a> covers polynomials, inequalities, linear algebra, groups, fields and conceptual calculus. <a href="#courses/academic-mathematics">Academic Mathematics</a> contains the mathematics library, from sets and functions through trigonometry, geometry, calculus, statistics and probability.</p>
        <p><a href="#courses/general-biology">General Biology</a> examines living systems from molecules and cells to whole organisms. <a href="#courses/chemistry">Chemistry</a> considers atomic structure, molecular bonding, thermodynamics, equilibrium and reactions. Books, papers, lecture notes and exercises are collected under <a href="#materials">Materials</a>.</p>
      </article>
      <aside class="home-sidebar" aria-labelledby="home-institute-title"><h2 id="home-institute-title">π Institute for Inquiry and Fundamental Studies</h2><p>Visit <a href="https://www.instagram.com/piifs.india/" target="_blank" rel="noopener">PIIFS on Instagram</a>.</p></aside>
    </div>`;
}
