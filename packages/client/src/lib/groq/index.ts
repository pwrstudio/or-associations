export const nodesQuery = `
	*[_type == "node"] {
		_id,
		geopoint,
		city,
		region,
		country,
		timezone,
		checkedInAt
	}
`;

export const artistsQuery = `
	*[_type == "artist"] | order(name asc) {
		_id,
		name,
		slug,
		profileImage {
			...,
			asset->
		},
		bio
	}
`;

export const artistBySlugQuery = `
	*[_type == "artist" && slug.current == $slug][0] {
		_id,
		name,
		slug,
		profileImage {
			...,
			asset->
		},
		bio,
		"works": *[_type == "work" && references(^._id)] | order(year desc, title asc) {
			_id,
			title,
			slug,
			year
		},
		"projects": *[_type == "project" && references(^._id)] | order(dateStart desc, title asc) {
			_id,
			title,
			slug,
			category
		},
		"pages": *[_type == "page" && references(^._id)] | order(title asc) {
			_id,
			title,
			slug
		}
	}
`;

export const worksQuery = `
	*[_type == "work"] | order(year desc, title asc) {
		_id,
		title,
		slug,
		year,
		artists[]-> {
			_id,
			name,
			slug
		},
		media[] {
			_type,
			_key,
			caption,
			image {
				...,
				asset->
			},
			file {
				...,
				asset->
			},
			url
		},
		description,
		medium
	}
`;

export const workBySlugQuery = `
	*[_type == "work" && slug.current == $slug][0] {
		_id,
		title,
		slug,
		year,
		artists[]-> {
			_id,
			name,
			slug
		},
		media[] {
			_type,
			_key,
			caption,
			image {
				...,
				asset->
			},
			file {
				...,
				asset->
			},
			url
		},
		description,
		medium
	}
`;

export const projectsQuery = `
	*[_type == "project"] | order(dateStart desc, title asc) {
		_id,
		title,
		slug,
		category,
		artists[]-> {
			_id,
			name,
			slug
		},
		slideshow[] {
			_type,
			_key,
			caption,
			image {
				...,
				asset->
			},
			file {
				...,
				asset->
			},
			url
		},
		description,
		media[] {
			_type,
			_key,
			caption,
			image {
				...,
				asset->
			},
			file {
				...,
				asset->
			}
		},
		location,
		dateStart,
		dateEnd,
		time,
		works[]-> {
			_id,
			title,
			slug
		}
	}
`;

export const projectBySlugQuery = `
	*[_type == "project" && slug.current == $slug][0] {
		_id,
		title,
		slug,
		category,
		artists[]-> {
			_id,
			name,
			slug
		},
		slideshow[] {
			_type,
			_key,
			caption,
			image {
				...,
				asset->
			},
			file {
				...,
				asset->
			},
			url
		},
		description,
		media[] {
			_type,
			_key,
			caption,
			image {
				...,
				asset->
			},
			file {
				...,
				asset->
			}
		},
		location,
		dateStart,
		dateEnd,
		time,
		works[]-> {
			_id,
			title,
			slug
		}
	}
`;

export const pagesQuery = `
	*[_type == "page"] | order(title asc) {
		_id,
		title,
		slug,
		content,
		artists[]-> {
			_id,
			name,
			slug
		}
	}
`;

export const pageBySlugQuery = `
	*[_type == "page" && slug.current == $slug][0] {
		_id,
		title,
		slug,
		content,
		artists[]-> {
			_id,
			name,
			slug
		}
	}
`;
