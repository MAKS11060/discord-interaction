export interface Post {
  id: number
  created_at: string
  uploader_id: number
  score: number
  source: string
  md5: string
  last_comment_bumped_at: null | string
  rating: string | 'g' | 's' | 'q' | 'e'
  image_width: number
  image_height: number
  tag_string: string
  fav_count: number
  file_ext: string
  last_noted_at: string | null
  parent_id: number | null
  has_children: boolean
  approver_id: number
  tag_count_general: number
  tag_count_artist: number
  tag_count_character: number
  tag_count_copyright: number
  file_size: number
  up_score: number
  down_score: number
  is_pending: boolean
  is_flagged: boolean
  is_deleted: boolean
  tag_count: number
  updated_at: string
  is_banned: boolean
  pixiv_id: number | null
  last_commented_at: string | null
  has_active_children: boolean
  bit_flags: number
  tag_count_meta: number
  has_large: boolean
  has_visible_children: boolean
  media_asset: PostMediaAsset
  tag_string_general: string
  tag_string_character: string
  tag_string_copyright: string
  tag_string_artist: string
  tag_string_meta: string
  file_url: string
  large_file_url: string
  preview_file_url: string
}

export interface PostMediaAsset {
  id: number
  created_at: string
  updated_at: string
  md5: string
  file_ext: string
  file_size: number
  image_width: number
  image_height: number
  duration: null | number
  status: string
  file_key: string
  is_public: boolean
  pixel_hash: string
  variants: PostMediaAssetVariant[]
}

export interface PostMediaAssetVariant {
  type: string
  url: string
  width: number
  height: number
  file_ext: string
}

export interface DanbooruConfig {
  login: string
  apikey: string
}

export class Danbooru {
  readonly origin = new URL('https://danbooru.donmai.us')

  constructor(private readonly config: Readonly<DanbooruConfig>) {
    this.origin.username = config.login
    this.origin.password = config.apikey
  }

  async post(id: number) {
    const uri = new URL(`/posts/${id}.json`, this.origin)

    const res = await fetch(uri)
    if (!res.ok) return null
    return await res.json() as Post
  }

  async saveSearchPosts() {
    const uri = new URL('/posts/random.json', this.origin)
    uri.searchParams.set('tags', 'search:all')

    const res = await fetch(uri)
    if (!res.ok) return null
    return await res.json() as Post
  }

  async userFavorites(username: string) {
    const uri = new URL('/posts/random.json', this.origin)
    uri.searchParams.set('tags', `ordfav:${username} -video`)

    const res = await fetch(uri)
    if (!res.ok) return null
    return await res.json() as Post
  }
}
