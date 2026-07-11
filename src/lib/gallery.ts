import { wixClient } from './wix';
import { mapRow, type GalleryItem } from './galleryData';

export type { GalleryItem } from './galleryData';
export { CATS } from './galleryData';

/** Query the live CMS collection (browser SDK) and map to GalleryItems, sorted by `sort` ASC. */
export async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await wixClient.items
    .query('GardenCollectionImages')
    .ascending('sort')
    .limit(100)
    .find();

  const rows: any[] = (res as any).items || [];
  return rows
    .map(mapRow)
    .filter(Boolean)
    .sort((a, b) => (a as GalleryItem).num - (b as GalleryItem).num) as GalleryItem[];
}
