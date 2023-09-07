module.exports = function(filename) {
  const parts = filename.split('/');

  if (parts.length > 3) {
    return filename;
  }

  return `/v${Date.now()}/kartchners${filename.startsWith('/') ? '' : '/'}${filename}`;
}