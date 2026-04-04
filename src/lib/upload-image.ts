export async function uploadImage(file: File): Promise<string> {
  // Get auth params from our API
  const authRes = await fetch("/api/imagekit/auth");
  if (!authRes.ok) throw new Error("Failed to get upload auth");
  const { token, expire, signature } = await authRes.json();

  // Upload to ImageKit
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", `doctor-${Date.now()}`);
  formData.append("folder", "/doctor-tracker/profiles");
  formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
  formData.append("signature", signature);
  formData.append("expire", String(expire));
  formData.append("token", token);

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) throw new Error("Image upload failed");

  const data = await uploadRes.json();
  return data.url;
}
