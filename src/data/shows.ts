// Datos provisionales de desfiles. Cuando haya CMS (Sanity u otro), esto se sustituye
// por una consulta y el componente de la home no cambia.
export interface Show {
  slug: string;
  title: string;
  season: string;
  image?: string; // ruta en /public o URL; sin imagen se muestra el placeholder
}

export const shows: Show[] = [
  { slug: 'desfile-01', title: 'Título del desfile', season: 'Temporada' },
  { slug: 'desfile-02', title: 'Título del desfile', season: 'Temporada' },
  { slug: 'desfile-03', title: 'Título del desfile', season: 'Temporada' },
  { slug: 'desfile-04', title: 'Título del desfile', season: 'Temporada' },
  { slug: 'desfile-05', title: 'Título del desfile', season: 'Temporada' },
];
