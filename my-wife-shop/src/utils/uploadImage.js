import { supabase } from '../supabaseClient';
/* helpers -------------------------------------------------------------- */
const PRODUCT_BUCKET = 'product-images';   
/**
 * Uploads a File object to Supabase Storage and returns its public URL.
 */
async function uploadImageToBucket(file, bucket = PRODUCT_BUCKET) {
  if (!file) return null;

  const user = (await supabase.auth.getUser()).data.user;
    const fileName = `${user.id}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data: urlData, error: urlError } = await supabase
    .storage
    .from(bucket)
    .getPublicUrl(fileName);

  if (urlError) {
    console.error('URL error:', urlError);
    throw urlError;
  }
  return urlData.publicUrl;
}
export { uploadImageToBucket };
