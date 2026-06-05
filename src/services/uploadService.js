export async function uploadImage(file, folder = 'profiles') {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('Cloudinary not configured. Using mock upload.');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a mock padel court image
        resolve(`https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800`);
      }, 1000);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'padelpro_uploads');
  formData.append('folder', `padelpro/${folder}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}

export function getOptimizedUrl(url, w = 400, h = 400) {
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,f_auto,q_auto/`);
}
