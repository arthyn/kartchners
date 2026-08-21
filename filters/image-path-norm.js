module.exports = function(filename) {
  if (!filename) {
    return filename;
  }
  
  if (filename.startsWith('/images/')) {
    return filename;
  }

  const parts = filename.split('/');
  const strip = filename.replace('/images', '');

  if (parts.length > 3) {
    return filename;
  }

  return `/v${Date.now()}/kartchners${strip.startsWith('/') ? '' : '/'}${strip}`;
}