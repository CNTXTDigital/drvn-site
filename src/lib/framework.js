// The DRVN Readiness Framework: DRVN's own way of judging readiness, informed by research
// and experience. It is not a licensing standard. One source of truth for every page that
// uses it. In article Markdown, write <!--drvn:framework--> for the full framework or
// <!--drvn:framework-ref--> for the one-line reference; posts.js swaps them in.

export const FRAMEWORK_URL = '/is-my-teen-ready-to-drive-alone/#drvn-readiness-framework';

export const FRAMEWORK = {
  name: 'The DRVN Readiness Framework',
  intro: 'DRVN evaluates readiness as more than hours or a passed road test. A teen is approaching independent readiness when they consistently demonstrate control, awareness, judgment, coverage and independence.',
  note: 'This is a DRVN framework, informed by research and nearly ten years of working with families. It is not a licensing standard, and it doesn’t replace your judgment. It gives that judgment something specific to look at.',
  dimensions: [
    { name: 'Control', text: 'Vehicle operation is smooth, consistent and largely automatic.' },
    { name: 'Awareness', text: 'The teen notices hazards and changing conditions without needing prompts.' },
    { name: 'Judgment', text: 'The teen chooses appropriate speed, following distance, gaps and responses.' },
    { name: 'Coverage', text: 'The teen has meaningful experience across different roads, conditions and driving situations.' },
    { name: 'Independence', text: 'The supervising adult is no longer supplying a significant portion of the driving decisions.' },
  ],
};

export const frameworkHTML = () => `<section class="framework" id="drvn-readiness-framework" aria-labelledby="fw-h">
<div class="fw-k">A DRVN framework</div>
<h3 id="fw-h">${FRAMEWORK.name}</h3>
<p class="fw-intro">${FRAMEWORK.intro}</p>
<ol class="fw-list">${FRAMEWORK.dimensions.map((d) => `<li><b>${d.name}</b><span>${d.text}</span></li>`).join('')}</ol>
<p class="fw-note">${FRAMEWORK.note}</p>
</section>`;

export const frameworkRefHTML = () => `<p class="fw-ref"><span class="fw-k">DRVN Readiness Framework</span> ${FRAMEWORK.dimensions.map((d) => d.name).join(' · ')}. <a href="${FRAMEWORK_URL}">See how DRVN evaluates readiness</a></p>`;

export const expandFramework = (html) => html
  .replace(/<!--\s*drvn:framework\s*-->/g, frameworkHTML())
  .replace(/<!--\s*drvn:framework-ref\s*-->/g, frameworkRefHTML());
