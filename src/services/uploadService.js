export async function uploadImage(file, folder = 'profiles') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'padelpro_uploads');
  formData.append('folder', `padelpro/${folder}`);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error('Cloudinary not configured');

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
