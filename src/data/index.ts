import type { Element, RawElement } from '../types/element';
import { categories, categoryNameMap } from '../config/categories';
import rawData from './elements.json';

const raw = rawData as { elements: RawElement[] };

export function processElementsData(): Element[] {
  return raw.elements.map(e => {
    const catId = categoryNameMap[e.category_ui_name] ?? 5;
    return {
      idx: e.number,
      sym: e.symbol,
      name: e.name,
      enName: e.name_en,
      mass: e.atomic_mass,
      cat: categories[catId],
      catId,
      colorHex: e.color_hex || categories[catId].color,

      period: e.period,
      group: e.group,
      block: e.block,
      xpos: e.xpos,
      ypos: e.ypos,

      radius: e.radius || 0,
      // Source gas densities are in g/L; normalize all densities to g/cm3.
      density: (e.density ?? 0) / (e.phase_en === 'Gas' ? 1000 : 1),
      melt: e.melt || 0,
      boil: e.boil || 0,
      molarHeat: e.molar_heat || 0,
      phase: e.phase,
      phaseEn: e.phase_en,
      appearance: e.appearance,
      appearanceEn: e.appearance_en,

      en: e.electronegativity_pauling || 0,
      electronAffinity: e.electron_affinity || 0,
      ip: e.ionization_energies?.[0] || 0,
      ionizationEnergies: e.ionization_energies || [],
      valence: e.valence || [],

      shells: e.shells || [],
      electronConfig: e.electron_configuration || '',
      electronConfigSemantic: e.electron_configuration_semantic || '',

      isotopes: e.isotopes || [],

      category: e.category,
      categoryEn: e.category_en,

      discoveredBy: e.discovered_by,
      discoveredByEn: e.discovered_by_en,
      namedBy: e.named_by,
      namedByEn: e.named_by_en,

      summary: e.summary,
      summaryEn: e.summary_en,

      source: e.source,
      sourceEn: e.source_en,
      bohrModelImage: e.bohr_model_image,
      bohrModel3d: e.bohr_model_3d,
      image: e.image,
      cpkHex: e['cpk-hex'],
    };
  });
}
