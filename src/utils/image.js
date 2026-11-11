/**
 * Compresse une photo DANS LE TÉLÉPHONE avant l'envoi : 1280 px maximum, JPEG.
 * Une photo de 4 Mo passe à environ 200 Ko : envoi rapide même en 3G, et moins de data consommée.
 * Le navigateur redresse lui-même les photos prises en portrait (orientation EXIF).
 */
export async function compresserImage(fichier, coteMax = 1280, qualite = 0.8) {
  if (!fichier.type.startsWith('image/')) throw new Error("Ce fichier n'est pas une image.");

  let source;
  try {
    source = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
  } catch {
    source = await chargerImage(fichier);
  }

  const ratio = Math.min(1, coteMax / Math.max(source.width, source.height));
  const largeur = Math.round(source.width * ratio);
  const hauteur = Math.round(source.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = largeur;
  canvas.height = hauteur;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, largeur, hauteur);
  ctx.drawImage(source, 0, 0, largeur, hauteur);
  if (source.close) source.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', qualite));
  if (!blob) throw new Error('Impossible de préparer cette photo.');
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
}

function chargerImage(fichier) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Format de photo non reconnu : essaie en JPG ou PNG.')); };
    img.src = url;
  });
}
