import type {
	Artist,
	Work,
	Project,
	Page,
	Node,
	Slug,
	Geopoint,
	SanityImageHotspot,
	SanityImageCrop,
	SanityImageAsset,
	SanityFileAsset
} from '@sanity-types';

// Re-export commonly used sanity types
export type { Slug, Geopoint, Node };

// Expanded asset types (when using asset-> in GROQ)
export interface ExpandedImageAsset extends Pick<SanityImageAsset, '_id' | 'url'> {}
export interface ExpandedFileAsset extends Pick<SanityFileAsset, '_id' | 'url'> {}

// Expanded reference types (when dereferencing with -> in GROQ)
export interface ArtistRef extends Pick<Artist, '_id' | 'name' | 'slug'> {}
export interface WorkRef extends Pick<Work, '_id' | 'title' | 'slug'> {}

// Expanded media types (with dereferenced assets)
export interface ExpandedImage {
	asset?: ExpandedImageAsset;
	hotspot?: SanityImageHotspot;
	crop?: SanityImageCrop;
}

export interface ImageMedia {
	_type: 'imageMedia';
	_key: string;
	image?: ExpandedImage;
	caption?: string;
}

export interface VideoMedia {
	_type: 'videoMedia';
	_key: string;
	file?: {
		asset?: ExpandedFileAsset;
	};
	caption?: string;
}

export interface AudioMedia {
	_type: 'audioMedia';
	_key: string;
	file?: {
		asset?: ExpandedFileAsset;
	};
	caption?: string;
}

export interface EmbedMedia {
	_type: 'embedMedia';
	_key: string;
	url?: string;
	caption?: string;
}

export type MediaItem = ImageMedia | VideoMedia | AudioMedia | EmbedMedia;

// Expanded document types (with dereferenced relations from GROQ queries)
export interface ExpandedArtist extends Omit<Artist, 'profileImage'> {
	profileImage?: ExpandedImage;
}

export interface ExpandedWork extends Omit<Work, 'artists' | 'media'> {
	artists?: ArtistRef[];
	media?: MediaItem[];
}

export interface ExpandedProject extends Omit<
	Project,
	'artists' | 'slideshow' | 'media' | 'works'
> {
	artists?: ArtistRef[];
	slideshow?: MediaItem[];
	media?: MediaItem[];
	works?: WorkRef[];
}

export interface ExpandedPage extends Omit<Page, 'artists'> {
	artists?: ArtistRef[];
}

// Node data subset for client display (excludes internal fields)
export type NodeData = Pick<
	Node,
	'geopoint' | 'city' | 'region' | 'country' | 'timezone' | 'checkedInAt'
> & {
	_id: string;
};
