// Colecciones de DELTELL.
//
// Cómo añadir o editar una colección cuando la clienta pase el material:
//  1. Copia las fotos a /public/img/colecciones/<slug>/
//  2. Rellena `fabric` (foto detalle de tela, es el "lomo") y `blocks` (el relato).
//  3. Nada más: la lista y la página de cada colección se generan solas.
//
// Mientras no haya fotos, se muestran placeholders con el color `tone`.

export type Offset = 'none' | 'sm' | 'md' | 'lg';

export type Block =
  | {
      type: 'text';
      /** Columnas de la rejilla de 12 (escritorio), p. ej. "2 / 7". En móvil ocupa todo. */
      col: string;
      heading?: string;
      paragraphs: string[];
      /** Empuja el bloque hacia abajo para romper la línea (editorial). */
      offset?: Offset;
    }
  | {
      type: 'image';
      col: string;
      src?: string;
      alt?: string;
      /** Proporción: '3/4' vertical, '4/5', '1/1', '3/2' o '16/9' apaisada. */
      ratio?: '3/4' | '4/5' | '1/1' | '3/2' | '16/9';
      caption?: string;
      offset?: Offset;
    }
  | {
      type: 'quote';
      col: string;
      text: string;
      offset?: Offset;
    };

/** Portada de la colección: siempre ocupa toda la pantalla. Dos formatos: */
export type Hero =
  | {
      /** Vídeo en bucle a pantalla completa. */
      type: 'video';
      src: string;
      /** Versión vertical para móvil (opcional; si no, se usa `src`). */
      srcMobile?: string;
      poster?: string;
    }
  | {
      /** Transición con scroll: al bajar, cada foto "sube" y cubre a la anterior. */
      type: 'scroll';
      /** Fotos en orden. Sin `src` se pinta un placeholder con el color `tone`. */
      slides: { src?: string; alt?: string; tone?: string }[];
    };

export interface Collection {
  slug: string;
  name: string;
  season: string;
  hero: Hero;
  /** Foto detalle de las telas (lomo en el listado). Sin foto → textura placeholder. */
  fabric?: string;
  /** Color del placeholder del lomo. */
  tone: string;
  /** Frase corta bajo el título de la colección. */
  lead: string;
  blocks: Block[];
}

// Relato de ejemplo con la maquetación típica de revista: textos y fotos alternados
// libremente. La clienta lo sustituirá por el suyo.
const sampleBlocks = (): Block[] => [
  { type: 'image', col: '1 / 8', ratio: '3/2', caption: 'Pie de foto' },
  {
    type: 'text',
    col: '9 / 13',
    offset: 'lg',
    heading: 'El punto de partida',
    paragraphs: [
      'Aquí irá el texto con el que se presenta la colección: de dónde nace, qué la inspira y qué quiere contar.',
    ],
  },
  { type: 'image', col: '2 / 6', ratio: '3/4', offset: 'md' },
  { type: 'image', col: '7 / 12', ratio: '4/5', offset: 'lg' },
  {
    type: 'text',
    col: '3 / 8',
    heading: 'Los materiales',
    paragraphs: [
      'Un párrafo sobre las telas y los procesos. Las fotos de detalle de esta colección acompañarán este texto.',
      'Los textos y las fotos se pueden colocar y alternar libremente por la página.',
    ],
  },
  { type: 'quote', col: '2 / 12', text: 'Una frase que resuma la colección.' },
  { type: 'image', col: '1 / 13', ratio: '16/9' },
  { type: 'image', col: '8 / 13', ratio: '3/4', offset: 'sm' },
  {
    type: 'text',
    col: '2 / 7',
    offset: 'md',
    paragraphs: ['Cierre del relato: créditos, equipo, localización o lo que la clienta quiera añadir.'],
  },
];

// Hero de ejemplo con transición de scroll (3 fotos placeholder).
const sampleScrollHero = (tone: string): Hero => ({
  type: 'scroll',
  slides: [{ tone }, { tone: '#1c1c1c' }, { tone: '#b8456f' }],
});

export const collections: Collection[] = [
  { slug: 'coleccion-01', name: 'Colección 01', season: 'Temporada', hero: sampleScrollHero('#5a1a2c'), tone: '#5a1a2c', lead: 'Frase corta de la colección.', blocks: sampleBlocks() },
  { slug: 'coleccion-02', name: 'Colección 02', season: 'Temporada', hero: { type: 'video', src: '/video/colecciones/coleccion-02.mp4' }, tone: '#1c1c1c', lead: 'Frase corta de la colección.', blocks: sampleBlocks() },
  { slug: 'coleccion-03', name: 'Colección 03', season: 'Temporada', hero: sampleScrollHero('#7d8388'), tone: '#7d8388', lead: 'Frase corta de la colección.', blocks: sampleBlocks() },
  { slug: 'coleccion-04', name: 'Colección 04', season: 'Temporada', hero: { type: 'video', src: '/video/colecciones/coleccion-04.mp4' }, tone: '#b8456f', lead: 'Frase corta de la colección.', blocks: sampleBlocks() },
  { slug: 'coleccion-05', name: 'Colección 05', season: 'Temporada', hero: sampleScrollHero('#b9a791'), tone: '#b9a791', lead: 'Frase corta de la colección.', blocks: sampleBlocks() },
];
