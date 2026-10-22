/** HLS stream (.m3u8 playlist or Nike's manifest endpoint). */
export function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url) || url.includes("asset_video_manifest");
}

export function isVideoUrl(url: string): boolean {
  return isHlsUrl(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url);
}
