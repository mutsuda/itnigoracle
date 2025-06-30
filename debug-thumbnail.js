// Debug para extracción de video_id
const urls = [
  "https://www.youtube.com/embed/Ej5KyL2PnqU?start=3157",
  "https://www.youtube.com/watch?v=Ej5KyL2PnqU",
  "https://youtu.be/Ej5KyL2PnqU"
];

urls.forEach(url => {
  console.log(`\nURL: ${url}`);
  
  let videoId = null;
  
  // Intentar diferentes patrones de URL de YouTube
  if (url.includes('youtube.com')) {
    videoId = url.match(/[?&]v=([^&]+)/)?.[1] || 
             url.match(/youtu\.be\/([^?]+)/)?.[1] ||
             url.match(/embed\/([^?]+)/)?.[1];
  }
  
  console.log(`Video ID extraído: ${videoId}`);
  console.log(`Thumbnail URL: ${videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'null'}`);
}); 